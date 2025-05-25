import scrapy
from image_crawler.items import ImageMetadataItem
from datetime import datetime

class ImageSpider(scrapy.Spider):
    name = "image_spider"
    # start_urls = ["http://quotes.toscrape.com/"] # Example URL, will be dynamic

    def __init__(self, *args, **kwargs):
        super(ImageSpider, self).__init__(*args, **kwargs)
        self.start_urls = [kwargs.get('start_url')]
        self.crawl_job_id = kwargs.get('crawl_job_id') # To link images to a specific crawl job
        self.crawl_depth = int(kwargs.get('crawl_depth', 1))
        self.current_depth = 0
        self.image_count = 0

    def parse(self, response):
        self.logger.info(f"Crawling: {response.url} (Depth: {self.current_depth})")

        # Extract image metadata
        for img in response.css('img'):
            image_url = img.attrib.get('src')
            if image_url:
                # Make sure the image URL is absolute
                image_url = response.urljoin(image_url)
                
                item = ImageMetadataItem()
                item['url'] = image_url
                item['alt_text'] = img.attrib.get('alt')
                # width, height, size, format can be extracted by further processing or by downloading the image
                item['source_url'] = response.url
                item['crawl_date'] = datetime.now().isoformat()
                # tags and model_test_results will be added later or by other pipelines/processes
                yield item
                self.image_count += 1

        # Follow links to other pages if crawl_depth allows
        if self.current_depth < self.crawl_depth:
            self.current_depth += 1
            for a in response.css('a::attr(href)'):
                yield response.follow(a, callback=self.parse)

    def closed(self, reason):
        self.logger.info(f"Spider closed: {self.name}, Reason: {reason}")
        # Here you might update the CrawlJobItem with end_time, image_count, errors
        # This would require fetching the CrawlJobItem from DB, updating, and saving.
        # For simplicity, we'll just log for now.
        self.logger.info(f"Crawl Job {self.crawl_job_id} completed. Total images crawled: {self.image_count}")
