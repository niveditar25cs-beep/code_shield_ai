"""
extractor.py
~~~~~~~~~~~~
Extract third-party import names from Python source code using ast.
"""

import ast
import sys
import builtins

# Standard library top-level modules (Python 3.x fallback + stdlib_module_names if present).
# We skip these so only third-party packages are returned.
_FALLBACK_STDLIB = {
    "__future__", "__main__", "_thread", "abc", "aifc", "argparse", "array",
    "ast", "asynchat", "asyncio", "asyncore", "atexit", "audioop", "base64",
    "bdb", "binascii", "binhex", "bisect", "builtins", "bz2", "calendar",
    "cgi", "cgitb", "chunk", "cmath", "cmd", "code", "codecs", "codeop",
    "collections", "colorsys", "compileall", "concurrent", "configparser",
    "contextlib", "contextvars", "copy", "copyreg", "cProfile", "csv",
    "ctypes", "curses", "dataclasses", "datetime", "dbm", "decimal",
    "difflib", "dis", "distutils", "doctest", "email", "encodings", "enum",
    "errno", "faulthandler", "fcntl", "filecmp", "fileinput", "fnmatch",
    "fractions", "ftplib", "functools", "gc", "getopt", "getpass", "gettext",
    "glob", "grp", "gzip", "hashlib", "heapq", "hmac", "html", "http",
    "idlelib", "imaplib", "imghdr", "imp", "importlib", "inspect", "io",
    "ipaddress", "itertools", "json", "keyword", "lib2to3", "linecache",
    "locale", "logging", "lzma", "mailbox", "mailcap", "marshal", "math",
    "mimetypes", "mmap", "modulefinder", "multiprocessing", "netrc",
    "nis", "nntplib", "numbers", "operator", "optparse", "os", "ossaudiodev",
    "pathlib", "pdb", "pickle", "pickletools", "pipes", "pkgutil", "platform",
    "plistlib", "poplib", "posix", "posixpath", "pprint", "profile", "pstats",
    "pty", "pwd", "py_compile", "pyclbr", "pydoc", "queue", "quopri",
    "random", "re", "readline", "reprlib", "resource", "rlcompleter",
    "runpy", "sched", "secrets", "select", "selectors", "shelve", "shlex",
    "shutil", "signal", "site", "smtpd", "smtplib", "sndhdr", "socket",
    "socketserver", "spwd", "sqlite3", "sre_compile", "sre_constants",
    "sre_parse", "ssl", "stat", "statistics", "string", "stringprep",
    "struct", "subprocess", "sunau", "symtable", "sys", "sysconfig",
    "syslog", "tabnanny", "tarfile", "telnetlib", "tempfile", "termios",
    "test", "textwrap", "threading", "time", "timeit", "tkinter", "token",
    "tokenize", "tomllib", "trace", "traceback", "tracemalloc", "tty",
    "turtle", "turtledemo", "types", "typing", "unicodedata", "unittest",
    "urllib", "uu", "uuid", "venv", "warnings", "wave", "weakref",
    "webbrowser", "winreg", "winsound", "wsgiref", "xdrlib", "xml",
    "xmlrpc", "zipapp", "zipfile", "zipimport", "zlib", "zoneinfo",
    "_ast", "_collections_abc", "_weakrefset", "genericpath",
    "ntpath", "posixpath", "fnmatch",
}

STDLIB_MODULES = set(getattr(sys, "stdlib_module_names", _FALLBACK_STDLIB)) | _FALLBACK_STDLIB
BUILTIN_NAMES = set(dir(builtins))


def extract_imports(source_code: str) -> list[str]:
    """
    Parse Python source with ast and return a deduplicated, sorted list of
    top-level third-party import names (not stdlib, not relative).

    Raises SyntaxError if source code cannot be parsed.
    """
    tree = ast.parse(source_code)
    imports: set[str] = set()

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                top = alias.name.split(".")[0]
                if top not in STDLIB_MODULES and top not in BUILTIN_NAMES:
                    imports.add(top)
        elif isinstance(node, ast.ImportFrom):
            # Skip relative imports (level > 0)
            if node.level and node.level > 0:
                continue
            if node.module:
                top = node.module.split(".")[0]
                if top not in STDLIB_MODULES and top not in BUILTIN_NAMES:
                    imports.add(top)

    return sorted(imports)
