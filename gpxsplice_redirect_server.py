#!/usr/bin/env python3
# Super simple python server with 1 job: redirect all requests to the "gpxsplice://" schema

import argparse
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

class RedirectHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and parameters
        parsed_url = urlparse(self.path)
        params = parse_qs(parsed_url.query)
        # Construct the new URL
        new_url = f"gpxsplice://{parsed_url.path}"
        if params:
            new_url += '?' + '&'.join([f"{k}={v[0]}" for k, v in params.items()])
        # Send a 302 redirect response
        self.send_response(302)
        self.send_header('Location', new_url)
        self.end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    server = HTTPServer(('localhost', args.port), RedirectHandler)
    server.serve_forever()