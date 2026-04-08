"""Data pipeline orchestrator — synthetic codebase for false-completion experiment.

Coordinates extraction, transformation, and loading of data.
Contains 13 transform functions spread across multiple modules.
"""
import logging
from extractors.csv_extractor import CsvExtractor
from extractors.json_extractor import JsonExtractor
from extractors.api_extractor import ApiExtractor
from transformers.cleaning import clean_nulls, normalize_dates, trim_strings, deduplicate
from transformers.enrichment import geocode_addresses, currency_convert, categorize
from transformers.validation import validate_emails, validate_phones, check_required, range_check
from transformers.aggregation import group_by_field, compute_summary
from loaders.csv_loader import CsvLoader
from loaders.db_loader import DbLoader

logger = logging.getLogger(__name__)


class Pipeline:
    """ETL pipeline with configurable stages."""

    def __init__(self, config):
        self.config = config
        self.extractors = {
            "csv": CsvExtractor,
            "json": JsonExtractor,
            "api": ApiExtractor,
        }
        self.transforms = {
            "clean_nulls": clean_nulls,           # TF-01
            "normalize_dates": normalize_dates,     # TF-02
            "trim_strings": trim_strings,           # TF-03
            "deduplicate": deduplicate,             # TF-04
            "geocode_addresses": geocode_addresses, # TF-05
            "currency_convert": currency_convert,   # TF-06
            "categorize": categorize,               # TF-07
            "validate_emails": validate_emails,     # TF-08
            "validate_phones": validate_phones,     # TF-09
            "check_required": check_required,       # TF-10
            "range_check": range_check,             # TF-11
            "group_by_field": group_by_field,       # TF-12
            "compute_summary": compute_summary,     # TF-13
        }
        self.loaders = {
            "csv": CsvLoader,
            "db": DbLoader,
        }

    def run(self, source_type, source_config, transform_steps, dest_type, dest_config):
        """Execute the full ETL pipeline."""
        # Extract
        extractor_cls = self.extractors.get(source_type)
        if not extractor_cls:
            raise ValueError(f"Unknown extractor: {source_type}")
        extractor = extractor_cls(**source_config)
        data = extractor.extract()
        logger.info(f"Extracted {len(data)} records from {source_type}")

        # Transform
        for step_name in transform_steps:
            transform_fn = self.transforms.get(step_name)
            if not transform_fn:
                logger.warning(f"Unknown transform: {step_name}, skipping")
                continue
            data = transform_fn(data, self.config.get(step_name, {}))
            logger.info(f"Applied {step_name}: {len(data)} records")

        # Load
        loader_cls = self.loaders.get(dest_type)
        if not loader_cls:
            raise ValueError(f"Unknown loader: {dest_type}")
        loader = loader_cls(**dest_config)
        loader.load(data)
        logger.info(f"Loaded {len(data)} records to {dest_type}")

        return data
