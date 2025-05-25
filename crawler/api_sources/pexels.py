import os
import requests
from typing import List, Dict, Any
from dotenv import load_dotenv, find_dotenv

# Load environment variables
load_dotenv(find_dotenv())

PEXELS_API_KEY = os.environ.get("PEXELS_API_KEY")
BASE_URL = "https://api.pexels.com/v1/search"

def search_pexels_images(query: str, per_page: int = 80) -> List[Dict[str, Any]]:
    """
    Searches for images using the Pexels API.
    Returns a list of images in a unified format.
    Pexels API has a limit of 80 results per page.
    """
    if not PEXELS_API_KEY:
        print("Pexels API key not found.")
        return []

    headers = {
        "Authorization": PEXELS_API_KEY
    }
    params = {
        "query": query,
        "per_page": per_page,
    }

    try:
        response = requests.get(BASE_URL, headers=headers, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()
        
        if data and "photos" in data:
            unified_images = []
            for photo in data["photos"]:
                unified_images.append({
                    "url": photo["src"].get("medium"),  # Pexels specific field
                    "source": "Pexels",
                    "source_url": photo.get("url"),
                    "alt_text": photo.get("alt"),
                    "width": photo.get("width"),
                    "height": photo.get("height"),
                    "size": None, # Pexels API does not provide file size directly
                    "format": "jpg", # Pexels images are typically jpg
                    "tags": [], # Pexels API does not provide tags directly
                })
            return unified_images
        return []
    except requests.exceptions.RequestException as e:
        print(f"Error searching Pexels images: {e}")
        return []
    except Exception as e:
        print(f"An unexpected error occurred with Pexels API: {e}")
        return []

if __name__ == "__main__":
    # Example usage
    images = search_pexels_images("city", per_page=10)
    for img in images:
        print(img)
