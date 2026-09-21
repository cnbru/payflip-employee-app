#!/usr/bin/env python3
"""Serve the HR Admin prototype locally with SPA route fallback."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


PROJECT_ROOT = Path(__file__).resolve().parent.parent
APP_ROOT = PROJECT_ROOT / "hr-admin"


class HrAdminHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def apply_spa_fallback(self):
        path = urlsplit(self.path).path
        requested = (PROJECT_ROOT / path.lstrip("/")).resolve()

        if (
            (path == "/hr-admin" or path.startswith("/hr-admin/"))
            and not requested.is_file()
            and not requested.is_dir()
            and not Path(path).suffix
        ):
            self.path = "/hr-admin/index.html"

    def do_GET(self):
        self.apply_spa_fallback()
        super().do_GET()

    def do_HEAD(self):
        self.apply_spa_fallback()
        super().do_HEAD()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=8001)
    args = parser.parse_args()

    handler = partial(HrAdminHandler, directory=str(PROJECT_ROOT))
    server = ThreadingHTTPServer(("", args.port), handler)
    print(f"HR Admin running at http://localhost:{args.port}/hr-admin/")

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
