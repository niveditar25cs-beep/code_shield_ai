"""
popular_packages.py
~~~~~~~~~~~~~~~~~~~~~
~150 well-known PyPI packages used for name-similarity comparison.
"""

POPULAR_PACKAGES = [
    # Web frameworks
    "flask", "django", "fastapi", "tornado", "bottle", "falcon", "sanic",
    "starlette", "aiohttp", "uvicorn", "gunicorn", "werkzeug", "jinja2",
    # HTTP clients
    "requests", "httpx", "urllib3", "aiofiles", "httpcore",
    # Data science / ML
    "numpy", "pandas", "scipy", "matplotlib", "seaborn", "scikit-learn",
    "sklearn", "tensorflow", "torch", "keras", "xgboost", "lightgbm",
    "catboost", "statsmodels", "sympy", "networkx",
    # Data processing
    "pillow", "opencv-python", "imageio", "pydantic", "attrs", "marshmallow",
    # Databases
    "sqlalchemy", "pymongo", "redis", "pymysql", "psycopg2", "motor",
    "databases", "tortoise-orm", "peewee", "alembic",
    # Auth / Security
    "cryptography", "pyopenssl", "paramiko", "bcrypt", "passlib",
    "pyjwt", "itsdangerous", "python-jose",
    # CLI
    "click", "typer", "rich", "colorama", "tqdm", "tabulate", "prettytable",
    "argparse", "docopt",
    # Testing
    "pytest", "unittest2", "mock", "hypothesis", "faker", "factory-boy",
    "responses", "coverage", "mypy", "pylint", "flake8", "black", "isort",
    # Async / Concurrency
    "asyncio", "trio", "anyio", "celery", "rq", "dramatiq", "apscheduler",
    # Config / Env
    "python-dotenv", "dynaconf", "pydantic-settings", "configparser",
    "toml", "pyyaml", "tomllib",
    # Serialization
    "orjson", "ujson", "msgpack", "protobuf", "avro-python3",
    # Cloud
    "boto3", "botocore", "google-cloud-storage", "azure-storage-blob",
    "google-auth", "google-api-python-client",
    # Dev tools
    "setuptools", "wheel", "pip", "twine", "build", "flit",
    "poetry", "virtualenv", "tox",
    # NLP
    "nltk", "spacy", "transformers", "gensim", "textblob",
    # Parsing
    "beautifulsoup4", "lxml", "html5lib", "pyparsing", "regex",
    # Utilities
    "six", "more-itertools", "toolz", "funcy", "boltons",
    "python-dateutil", "arrow", "pendulum", "pytz",
    "filelock", "portalocker", "watchdog", "schedule",
    "humanize", "chardet", "charset-normalizer", "idna", "certifi",
    # Type hints
    "typing-extensions", "annotated-types",
    # Jupyter
    "jupyter", "ipython", "notebook", "jupyterlab",
]
