# shared/config.py
# Common configuration settings for the crawler and dashboard.

# Supabase configuration
import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "YOUR_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "YOUR_SUPABASE_ANON_KEY")

# Image storage configuration (e.g., local path or cloud storage bucket)
IMAGE_STORAGE_PATH = "./images"

# Default crawling settings
DEFAULT_CRAWL_DEPTH = 1
DEFAULT_CRAWL_LIMIT = 100

# API endpoints for inter-service communication (if applicable)
CRAWLER_API_URL = "http://localhost:8000/api/crawler"
