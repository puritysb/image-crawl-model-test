import os
import uvicorn
import sys
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse # Import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv, find_dotenv
import uuid
from datetime import datetime
import asyncio
import requests # For downloading images if needed, and for API calls
import io
import zipfile

from supabase import create_client, Client

# Import API source clients
from crawler.api_sources import pixabay, pexels, unsplash, google_images

# Load environment variables from the .env file found by traversing up the directory tree
load_dotenv(find_dotenv())

# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_KEY")
supabase: Client = None

print("--- Environment Variable Debugging ---")
print("SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("SUPABASE_KEY:", os.getenv("SUPABASE_KEY"))
print("Current working directory:", os.getcwd())
print("------------------------------------")

if supabase_url and supabase_key:
    try:
        supabase = create_client(supabase_url, supabase_key)
        print("Supabase client initialized successfully in main.py.")
    except Exception as e:
        print(f"Failed to initialize Supabase client in main.py: {e}")
else:
    print("Supabase URL or Key not found in environment variables for main.py. Check .env file and environment setup.")

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

class CrawlRequest(BaseModel):
    keyword: str
    limit: int = 10 # Number of images to collect

async def run_image_search_in_background(keyword: str, limit: int, job_id: str):
    """
    Searches for images using various APIs and stores metadata in Supabase.
    Handles API priority and fallback to web crawling if needed.
    """
    if not supabase:
        print("Supabase client not available for background task.")
        return

    collected_images = []
    errors = []
    
    try:
        # Update job status to running and store PID
        # Note: PID is for the 'scrapy' command itself, not the Python process running FastAPI
        # For robust process management, consider a dedicated process manager or task queue.
        response_update_running = supabase.table("crawl_jobs").update({"status": "running"}).eq("id", job_id).execute()
        if not response_update_running.data:
            raise Exception(f"Supabase update failed for job {job_id} status to running.")
        print(f"Started image search for job {job_id} with keyword '{keyword}'")

        # --- API Based Search (Priority) ---
        api_sources = [
            (pixabay.search_pixabay_images, "Pixabay"),
            (pexels.search_pexels_images, "Pexels"),
            (unsplash.search_unsplash_images, "Unsplash"),
            (google_images.search_google_images, "Google Custom Search"), # New API
        ]

        for search_func, source_name in api_sources:
            if len(collected_images) >= limit:
                break
            
            print(f"Attempting to search {source_name} for '{keyword}'...")
            try:
                # Calculate remaining limit for current API call
                remaining_limit = limit - len(collected_images)
                if remaining_limit <= 0:
                    break
                
                # Each API has its own per_page limit
                per_page_limit = {
                    "Pixabay": 200,
                    "Pexels": 80,
                    "Unsplash": 30,
                    "Google Custom Search": 10, # Google Custom Search API limit
                }.get(source_name, 30) # Default to 30 if not found

                current_batch_limit = min(remaining_limit, per_page_limit)
                
                # Google Custom Search API uses 'num' instead of 'per_page'
                if source_name == "Google Custom Search":
                    images_from_api = search_func(keyword, num=current_batch_limit)
                else:
                    images_from_api = search_func(keyword, per_page=current_batch_limit)
                
                if images_from_api:
                    print(f"Found {len(images_from_api)} images from {source_name}.")
                    for img_data in images_from_api:
                        # Ensure all required fields are present and handle None
                        img_data['crawl_date'] = datetime.now().isoformat()
                        img_data['source_url'] = img_data.get('source_url', 'N/A')
                        img_data['alt_text'] = img_data.get('alt_text', '')
                        img_data['tags'] = img_data.get('tags', [])
                        img_data['url'] = img_data.get('url') # Ensure URL is present
                        img_data['source'] = img_data.get('source', source_name) # Ensure source is present

                        if img_data['url']: # Only store if URL is valid
                            img_data['keyword'] = keyword # Add the keyword to image metadata
                            collected_images.append(img_data)
                            if len(collected_images) >= limit:
                                break
                else:
                    print(f"No images found or API error from {source_name}.")
            except Exception as e:
                errors.append(f"API Error from {source_name}: {e}")
                print(f"API Error from {source_name}: {e}")

        # --- Backup Web Crawling (if needed and not enough images collected) ---
        # This part would involve Scrapy or BeautifulSoup4/requests for direct crawling
        # For now, we'll just add a placeholder.
        if len(collected_images) < limit:
            print(f"Not enough images collected from APIs ({len(collected_images)}/{limit}). Considering backup crawling...")
            # Here you would integrate Scrapy or BeautifulSoup4/requests
            # For example:
            # from crawler.spiders.web_crawler import WebCrawlerSpider
            # process = CrawlerProcess(get_project_settings())
            # process.crawl(WebCrawlerSpider, start_url=f"https://www.example.com/search?q={keyword}", ...)
            # process.start() # This would block, so needs careful handling in FastAPI context
            errors.append("Backup crawling not yet implemented.")

        # Store collected images in Supabase
        if collected_images:
            try:
                # Insert images in batches if there are many
                for img_data in collected_images:
                    # Remove 'source' field as it's not in image_metadata table, but useful for debugging
                    # Or add a 'source' column to image_metadata table
                    img_data_to_insert = {k: v for k, v in img_data.items() if k != 'source'}
                    response_insert_image = supabase.table("image_metadata").insert(img_data_to_insert).execute()
                    if not response_insert_image.data:
                        errors.append(f"Supabase insert error for image {img_data.get('url')}: {response_insert_image.data}")
                        print(f"Supabase insert error for image {img_data.get('url')}: {response_insert_image.data}")
            except Exception as e:
                errors.append(f"Supabase batch insert exception: {e}")
                print(f"Supabase batch insert exception: {e}")
        else:
            errors.append("No images collected.")

        # Update final crawl job status
        final_status = "completed" if len(collected_images) > 0 else "failed"
        response_final_update = supabase.table("crawl_jobs").update({
            "status": final_status,
            "end_time": datetime.now().isoformat(),
            "image_count": len(collected_images),
            "errors": errors if errors else None,
            "pid": None # Clear PID on completion/failure
        }).eq("id", job_id).execute()
        if not response_final_update.data:
            errors.append(f"Supabase final update failed for job {job_id}.")
            print(f"Supabase final update failed for job {job_id}.")
        print(f"Crawl job {job_id} finished with status: {final_status}, images: {len(collected_images)}")

    except Exception as e:
        error_message = f"Overall exception in image search for job {job_id}: {e}"
        print(error_message)
        if supabase:
            supabase.table("crawl_jobs").update({
                "status": "failed",
                "end_time": datetime.now().isoformat(),
                "errors": [error_message],
                "pid": None
            }).eq("id", job_id).execute()
        raise HTTPException(status_code=500, detail=error_message)

@app.get("/api/images/download")
async def download_images(keyword: str = None):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized.")

    query = supabase.table("image_metadata").select("url, alt_text, keyword")
    if keyword:
        query = query.or_(f"alt_text.ilike.%{keyword}%,tags.cs.{{\"{keyword}\"}},keyword.ilike.%{keyword}%")

    try:
        response = query.execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="No images found for the given keyword.")
        
        images_to_download = response.data

        # Create a in-memory zip file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for img_data in images_to_download:
                img_url = img_data.get("url")
                if not img_url:
                    continue
                
                try:
                    img_response = requests.get(img_url, stream=True)
                    img_response.raise_for_status()
                    
                    # Determine filename
                    filename = os.path.basename(img_url).split('?')[0] # Remove query params
                    if not filename or '.' not in filename:
                        # Fallback if filename is not clear from URL
                        filename = f"{img_data.get('keyword', 'image')}_{img_data['id']}.jpg"
                    
                    zip_file.writestr(filename, img_response.content)
                except requests.exceptions.RequestException as e:
                    print(f"Error downloading image {img_url}: {e}")
                except Exception as e:
                    print(f"An unexpected error occurred while processing image {img_url}: {e}")
        
        zip_buffer.seek(0)
        return StreamingResponse(zip_buffer, media_type="application/zip", headers={
            "Content-Disposition": "attachment; filename=filtered_images.zip"
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating zip file: {e}")

@app.get("/api/crawl/jobs")
async def get_crawl_jobs():
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized.")
    
    try:
        response = supabase.table("crawl_jobs").select("*").order("start_time", desc=True).execute()
        if not response.data: # Check if data is returned
            raise HTTPException(status_code=500, detail=f"Failed to fetch crawl jobs: No data returned.")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exception fetching crawl jobs: {e}")

@app.post("/api/crawl")
async def start_crawl_endpoint(request: CrawlRequest, background_tasks: BackgroundTasks):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase client not initialized.")

    job_id = str(uuid.uuid4())
    
    # Insert initial pending job status
    crawl_job_data = {
        "id": job_id,
        "status": "pending", # Set to pending initially
        "start_time": datetime.now().isoformat(),
        "target_url": request.keyword, # Use keyword as target_url for consistency
        "crawl_depth": request.limit, # Use limit as crawl_depth for consistency
        "image_count": 0,
        "errors": [],
        "pid": None # PID will be updated once subprocess starts
    }
    try:
        response_insert_job = supabase.table("crawl_jobs").insert(crawl_job_data).execute()
        if not response_insert_job.data:
            print(f"Error inserting initial crawl job: No data returned.")
            raise HTTPException(status_code=500, detail=f"Failed to create crawl job: No data returned.")
    except Exception as e:
        print(f"Exception inserting initial crawl job: {e}")
        raise HTTPException(status_code=500, detail=f"Exception creating crawl job: {e}")

    # Add the image search run to background tasks
    background_tasks.add_task(run_image_search_in_background, request.keyword, request.limit, job_id)

    return {"message": "Image search job initiated", "job_id": job_id}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
