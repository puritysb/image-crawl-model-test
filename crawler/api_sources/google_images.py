import os
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

GOOGLE_CUSTOM_SEARCH_API_KEY = os.environ.get("GOOGLE_CUSTOM_SEARCH_API_KEY")
GOOGLE_CSE_ID = os.environ.get("GOOGLE_CSE_ID")
BASE_URL = "https://www.googleapis.com/customsearch/v1"

def search_google_images(query: str, num: int = 10) -> List[Dict[str, Any]]:
    """
    Searches for images using the Google Custom Search API.
    Returns a list of images in a unified format.
    Google Custom Search API has a limit of 10 results per page.
    """
    if not GOOGLE_CUSTOM_SEARCH_API_KEY or not GOOGLE_CSE_ID:
        print("Google Custom Search API Key or CSE ID not found.")
        return []

    params = {
        "key": GOOGLE_CUSTOM_SEARCH_API_KEY,
        "cx": GOOGLE_CSE_ID,
        "q": query,
        "searchType": "image",
        "num": num, # Max 10 results per request
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        
        if data and "items" in data:
            unified_images = []
            for item in data["items"]:
                unified_images.append({
                    "url": item.get("link"),
                    "source": "Google Custom Search",
                    "source_url": item.get("image", {}).get("contextLink"),
                    "alt_text": item.get("title"),
                    "width": item.get("image", {}).get("width"),
                    "height": item.get("image", {}).get("height"),
                    "size": item.get("image", {}).get("byteSize"),
                    "format": item.get("fileFormat", "").replace("image/", ""),
                    "tags": [], # Google Custom Search API does not provide tags directly
                })
            return unified_images
        return []
    except requests.exceptions.RequestException as e:
        print(f"Error searching Google Custom Search images: {e}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred with Google Custom Search API: {e}")
        return []

if __name__ == "__main__":
    # Example usage (replace with your actual key and CSE ID)
    # os.environ["GOOGLE_CUSTOM_SEARCH_API_KEY"] = "YOUR_API_KEY"
    # os.environ["GOOGLE_CSE_ID"] = "YOUR_CSE_ID"
    images = search_google_images("cat", num=5)
    for img in images:
        print(img)
