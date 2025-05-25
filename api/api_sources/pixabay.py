import os
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

PIXABAY_API_KEY = os.environ.get("PIXABAY_API_KEY")
BASE_URL = "https://pixabay.com/api/"

def search_pixabay_images(query: str, per_page: int = 200) -> List[Dict[str, Any]]:
    """
    Searches for images using the Pixabay API.
    Returns a list of images in a unified format.
    """
    if not PIXABAY_API_KEY:
        print("Pixabay API key not found.")
        return []

    params = {
        "key": PIXABAY_API_KEY,
        "q": query,
        "image_type": "photo",
        "per_page": per_page,
        "safesearch": True,
    }

    try:
        response = requests.get(BASE_URL, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        
        if data and "hits" in data:
            unified_images = []
            for hit in data["hits"]:
                unified_images.append({
                    "url": hit.get("webformatURL"),  # Pixabay specific field
                    "source": "Pixabay",
                    "source_url": hit.get("pageURL"),
                    "alt_text": hit.get("tags"), # Pixabay tags can be used as alt_text
                    "width": hit.get("webformatWidth"),
                    "height": hit.get("webformatHeight"),
                    "size": None, # Pixabay API does not provide file size directly
                    "format": "jpg", # Most webformatURL are jpg
                    "tags": hit.get("tags").split(", ") if hit.get("tags") else [],
                })
            return unified_images
        return []
    except requests.exceptions.RequestException as e:
        print(f"Error searching Pixabay images: {e}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred with Pixabay API: {e}")
        return []

if __name__ == "__main__":
    # Example usage
    images = search_pixabay_images("nature", per_page=10)
    for img in images:
        print(img)
