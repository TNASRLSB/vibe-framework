"""CSV data loader."""
import csv


class CsvLoader:
    def __init__(self, filepath, delimiter=","):
        self.filepath = filepath
        self.delimiter = delimiter

    def load(self, records):
        if not records:
            return
        fieldnames = list(records[0].keys())
        with open(self.filepath, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=self.delimiter)
            writer.writeheader()
            writer.writerows(records)
