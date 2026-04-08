"""JSON data extractor."""
import json


class JsonExtractor:
    def __init__(self, filepath, record_path=None):
        self.filepath = filepath
        self.record_path = record_path

    def extract(self):
        with open(self.filepath, "r") as f:
            data = json.load(f)
        if self.record_path:
            for key in self.record_path.split("."):
                data = data[key]
        if isinstance(data, dict):
            return [data]
        return data
