#!/usr/bin/env python3
# Super simple python server with 1 job: redirect all requests to the "gpxsplice://" schema

import argparse
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import urllib.request
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - - [%(levelname)s] "%(message)s" %(status)s -',
    datefmt='%d/%b/%Y %H:%M:%S'
)

# Get client id and secret from the environment
import os
CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']

STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
# TODO: add a favicon
# TODO: post to my analytics server as well

class RedirectHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and parameters
        parsed_url = urlparse(self.path)
        params = parse_qs(parsed_url.query)
        if 'client_uri' not in params:
            logging.error(f"Missing client_uri in request: {self.path}")
            self.send_response(400)
            self.end_headers()
            return

        client_uri = params['client_uri'][0]

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

        req = urllib.request.Request(STRAVA_TOKEN_URL, data=data, method='POST')
        with urllib.request.urlopen(req) as f:
            res = f.read().decode('utf-8')
            # If 'access_token' is not present in response, then return an error page
            if 'access_token' not in res:
                logging.error(f"Error: {res}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(res.encode('utf-8'))
                return

        # Encode the result in the redirect URL parameters
        client_uri += '?' + urllib.parse.urlencode({'payload': res})
        # And encode the original URL parameters as well
        client_uri += '&' + parsed_url.query
        logging.info(f"Redirecting to {client_uri}")
        # Send a 302 redirect response
        self.send_response(302)
        self.send_header('Location', client_uri)
        self.end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    server = HTTPServer(('localhost', args.port), RedirectHandler)
    logging.info(f"Listening on port {args.port}...")
    server.serve_forever()