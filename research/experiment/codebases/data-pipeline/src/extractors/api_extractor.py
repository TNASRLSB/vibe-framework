"""API data extractor."""
import urllib.request
import json


class ApiExtractor:
    def __init__(self, url, headers=None, params=None):
        self.url = url
        self.headers = headers or {}
        self.params = params or {}

    def extract(self):
        # SMELL-01: uses urllib instead of requests, no error handling
        req = urllib.request.Request(self.url)
        for k, v in self.headers.items():
            req.add_header(k, v)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
        if isinstance(data, dict):
            return [data]
        return data
