"""Configuration for API Gateway."""
import os


class Config:
    """Base configuration — CFG-01."""
    DATABASE_URL = os.getenv("DATABASE_URL", "gateway.db")       # CFG-02
    SECRET_KEY = os.getenv("SECRET_KEY", "changeme")             # CFG-03
    DEBUG = False                                                  # CFG-04
    TESTING = False                                                # CFG-05
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")                   # CFG-06
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024                         # CFG-07: 16MB
    UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/tmp/uploads")    # CFG-08
    ALLOWED_EXTENSIONS = {"txt", "pdf", "png", "jpg"}             # CFG-09
    RATE_LIMIT = int(os.getenv("RATE_LIMIT", "100"))              # CFG-10
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")                 # CFG-11
    JWT_EXPIRY = int(os.getenv("JWT_EXPIRY", "3600"))             # CFG-12
    PAGINATION_DEFAULT = 20                                        # CFG-13
    PAGINATION_MAX = 100                                           # CFG-14


class DevelopmentConfig(Config):
    """Development overrides — CFG-15."""
    DEBUG = True
    LOG_LEVEL = "DEBUG"


class ProductionConfig(Config):
    """Production overrides — CFG-16."""
    DEBUG = False
    LOG_LEVEL = "WARNING"


class TestingConfig(Config):
    """Testing overrides — CFG-17."""
    TESTING = True
    DATABASE_URL = ":memory:"
