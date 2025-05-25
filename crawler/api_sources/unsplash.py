import os
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

UNSPLASH_ACCESS_KEY = os.environ.get("UNSPLASH_ACCESS_KEY")
BASE_URL = "https://api.unsplash.com/search/photos"

def search_unsplash_images(query: str, per_page: int = 30) -> List[Dict[str, Any]]:
    """
    Searches for images using the Unsplash API.
    Returns a list of images in a unified format.
    Unsplash API has a limit of 30 results per page for search.
    """
    if not UNSPLASH_ACCESS_KEY:
        print("Unsplash Access Key not found.")
        return []

    headers = {
        "Authorization": f"Client-ID {UNSPLASH_ACCESS_KEY}"
    }
    params = {
        "query": query,
        "per_page": per_page,
        "orientation": "landscape", # Common orientation for general images
    }

    try:
        response = requests.get(BASE_URL, headers=headers, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        
        if data and "results" in data:
            unified_images = []
            for result in data["results"]:
                unified_images.append({
                    "url": result["urls"].get("regular"),  # Unsplash specific field
                    "source": "Unsplash",
                    "source_url": result.get("links", {}).get("html"),
                    "alt_text": result.get("alt_description") or result.get("description"),
                    "width": result.get("width"),
                    "height": result.get("height"),
                    "size": None, # Unsplash API does not provide file size directly
                    "format": "jpg", # Unsplash images are typically jpg
                    "tags": [tag["title"] for tag in result.get("tags", []) if "title" in tag],
                })
            return unified_images
        return []
    except requests.exceptions.RequestException as e:
        print(f"Error searching Unsplash images: {e}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred with Unsplash API: {e}")
        return []

if __name__ == "__main__":
    # Example usage
    images = search_unsplash_images("mountains", per_page=5)
    for img in images:
        print(img)
