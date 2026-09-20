import sys
import os

# Add project root to path
_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# Add backend/ to path so `from scanner.xxx import ...` resolves correctly
_backend = os.path.join(_root, 'backend')

for _p in [_root, _backend]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from app import app  # noqa: E402 — app.py lives in backend/
