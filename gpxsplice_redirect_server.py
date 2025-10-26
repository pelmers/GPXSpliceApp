#!/usr/bin/env python3
# Super simple python server with 1 job: redirect all requests to the "gpxsplice://" schema

import argparse
import json
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import urllib.request
import logging
import urllib.parse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - - [%(levelname)s] %(message)s',
    datefmt='%d/%b/%Y %H:%M:%S'
)

# Get client id and secret from the environment
import os
CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']
THIS_DOMAIN = os.environ['THIS_DOMAIN']
ANALYTICS_API_KEY = os.environ['RYBBIT_API_KEY']
ANALYTICS_SITE_ID = "3"

STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
ANALYTICS_TRACK_URL = 'https://rubber.pelmers.com/api/track'

FAVICON = None
try:
    with open('assets/favicon.ico', 'rb') as favicon:
        FAVICON = favicon.read()
except FileNotFoundError:
    print("Favicon file not found at assets/favicon.ico. Favicon requests will return 404.")


def send_analytics_event(path, user_agent, ip_address):
    payload = {
        'api_key': ANALYTICS_API_KEY,
        'site_id': ANALYTICS_SITE_ID,
        'type': 'pageview',
        'pathname': path,
        'hostname': THIS_DOMAIN,
        'page_title': 'GPX Splice Redirect',
        'user_agent': user_agent or '',
        'ip_address': ip_address or '',
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        ANALYTICS_TRACK_URL,
        data=data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status not in (200, 202):
                body = resp.read().decode('utf-8', errors='ignore')
                logging.error(f"Analytics error: {resp.status} {resp.reason} {body}")
            else:
                logging.info("Analytics event sent")
    except Exception as e:
        logging.error(f"Failed to send analytics event: {e}")


class RedirectHandler(BaseHTTPRequestHandler):
    def handle_error(self, error_message):
        logging.error(f"Error: {error_message}")
        self.send_response(500)
        self.end_headers()
        self.wfile.write(error_message.encode('utf-8'))

    def do_HEAD(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Handle favicon first
        if self.path == '/favicon.ico':
            if FAVICON is not None:
                self.send_response(200)
                self.send_header('Content-type', 'image/x-icon')
                self.end_headers()
                self.wfile.write(FAVICON)
            else:
                self.send_response(404)
                self.end_headers()
            return
        # Parse the URL and parameters
        parsed_url = urlparse(self.path)
        params = parse_qs(parsed_url.query)
        if not self.path.startswith('/client_uri'):
            logging.error(f"Missing client_uri in request: {self.path}")
            self.send_response(400)
            self.end_headers()
            return

        # Decode everything after the /client_uri/ as the client uri
        client_uri = urllib.parse.unquote(parsed_url.path.split('/')[2])

        # Perform key exchange with the Strava API by sending the code with client id and secret
        if 'code' not in params:
            logging.error(f"Missing code in request: {self.path}")
            # Redirect back to client with error
            client_uri += '?' + urllib.parse.urlencode({'error': 'Missing code in request'})
            self.send_response(302)
            self.send_header('Location', client_uri)
            self.end_headers()
            return

        code = params['code'][0]
        logging.info(f"Exchanging code {code} for access token...")
        data = urllib.parse.urlencode({
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code'
        }).encode('ascii')

        try:
            req = urllib.request.Request(STRAVA_TOKEN_URL, data=data, method='POST')
            with urllib.request.urlopen(req) as f:
                res = f.read().decode('utf-8')
                # If 'access_token' is not present in response, then return an error page
                if 'access_token' not in res:
                    self.handle_error(res)
                    return
        except Exception as e:
            self.handle_error(f"Error exchanging code for access token: {e}")
            return

        logging.info(f"Redirecting to {client_uri}")
        # Encode the result in the redirect URL parameters
        client_uri += '?' + urllib.parse.urlencode({'payload': res})
        # And encode the original URL parameters as well
        client_uri += '&' + parsed_url.query
        # Send a 302 redirect response
        self.send_response(302)
        self.send_header('Location', client_uri)
        self.end_headers()
        client_ip = self.headers.get('X-Forwarded-For', self.client_address[0]).split(',')[0]
        threading.Thread(
            target=send_analytics_event,
            args=(self.path, self.headers.get('User-Agent'), client_ip)
        ).start()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    server = HTTPServer(('0.0.0.0', args.port), RedirectHandler)
    logging.info(f"Listening on port {args.port}...")
    server.serve_forever()
