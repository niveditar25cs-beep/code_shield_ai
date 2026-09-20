"""
normalizer.py
~~~~~~~~~~~~~
PEP 503 package name normalization and import-to-package name mapping.
"""

import re

# Map from import name to canonical PyPI package name
# e.g. `import cv2` -> install `opencv-python`
IMPORT_TO_PACKAGE = {
    "cv2": "opencv-python",
    "PIL": "pillow",
    "PIL.Image": "pillow",
    "sklearn": "scikit-learn",
    "yaml": "pyyaml",
    "bs4": "beautifulsoup4",
    "dotenv": "python-dotenv",
    "dateutil": "python-dateutil",
    "jose": "python-jose",
    "jwt": "pyjwt",
    "OpenSSL": "pyopenssl",
    "Crypto": "pycryptodome",
    "google.cloud": "google-cloud-storage",
    "google.auth": "google-auth",
    "googleapiclient": "google-api-python-client",
    "skimage": "scikit-image",
    "mpl_toolkits": "matplotlib",
    "scipy": "scipy",
    "np": "numpy",
    "pd": "pandas",
    "tf": "tensorflow",
    "wx": "wxpython",
    "gi": "pygobject",
    "gtk": "pygobject",
    "usb": "pyusb",
    "serial": "pyserial",
    "Levenshtein": "python-levenshtein",
    "fitz": "pymupdf",
    "docx": "python-docx",
    "pptx": "python-pptx",
    "xlrd": "xlrd",
    "xlwt": "xlwt",
    "openpyxl": "openpyxl",
    "magic": "python-magic",
    "psutil": "psutil",
    "zmq": "pyzmq",
    "gi.repository": "pygobject",
    "nacl": "pynacl",
    "paramiko": "paramiko",
    "boto3": "boto3",
    "botocore": "botocore",
    "jinja2": "jinja2",
    "Jinja2": "jinja2",
    "flask": "flask",
    "django": "django",
    "fastapi": "fastapi",
    "uvicorn": "uvicorn",
    "sqlalchemy": "sqlalchemy",
    "celery": "celery",
    "redis": "redis",
    "pymongo": "pymongo",
    "aiohttp": "aiohttp",
    "httpx": "httpx",
    "requests": "requests",
    "click": "click",
    "rich": "rich",
    "typer": "typer",
    "tqdm": "tqdm",
    "colorama": "colorama",
    "pydantic": "pydantic",
    "attrs": "attrs",
    "attr": "attrs",
    "toml": "toml",
    "tomllib": "tomllib",
    "orjson": "orjson",
    "ujson": "ujson",
    "msgpack": "msgpack",
}

_NORMALIZE_RE = re.compile(r"[-_.]+")


def normalize_name(name: str) -> str:
    """Apply PEP 503 normalization: lowercase, collapse [-_.] to '-'."""
    return _NORMALIZE_RE.sub("-", name).lower()


def import_to_package_name(import_name: str) -> str:
    """
    Map a Python import name to its canonical PyPI package name.
    Returns the normalized import name if no mapping exists.
    """
    # Check exact match first
    if import_name in IMPORT_TO_PACKAGE:
        return IMPORT_TO_PACKAGE[import_name]
    # Check top-level module (e.g. 'PIL.Image' -> 'PIL')
    top = import_name.split(".")[0]
    if top in IMPORT_TO_PACKAGE:
        return IMPORT_TO_PACKAGE[top]
    return normalize_name(import_name)
