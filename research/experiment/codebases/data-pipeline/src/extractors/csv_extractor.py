"""CSV data extractor."""
import csv


class CsvExtractor:
    def __init__(self, filepath, delimiter=",", encoding="utf-8"):
        self.filepath = filepath
        self.delimiter = delimiter
        self.encoding = encoding

    def extract(self):
        records = []
        with open(self.filepath, "r", encoding=self.encoding) as f:
            reader = csv.DictReader(f, delimiter=self.delimiter)
            for row in reader:
                records.append(dict(row))
        return records
