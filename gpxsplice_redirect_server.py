#!/usr/bin/env python3
# Super simple python server with 1 job: redirect all requests to the "gpxsplice://" schema

import argparse
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
import urllib.request
import json

# Get client id and secret from the environment
import os
CLIENT_ID = os.environ['CLIENT_ID']
CLIENT_SECRET = os.environ['CLIENT_SECRET']

STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

class RedirectHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Parse the URL and parameters
        parsed_url = urlparse(self.path)
        params = parse_qs(parsed_url.query)
        use_mobile = 'mobile' in parsed_url.path

        if use_mobile:
            # Construct the new URL with the app scheme (see app.json)
            client_url = f"gpxsplice://{parsed_url.path}"
            # NOTE: during development use the "exp" scheme for the Expo Go app
            client_url = f"exp://{parsed_url.path}"
        else:
            # TODO
            client_url = f"https://future-domain-name-for-this-app/{parsed_url.path}"

        # Perform key exchange with the Strava API by sending the code with client id and secret
        if 'code' not in params:
            print(f"Missing code in request: {self.path}")
            # Redirect back to client with error
            client_url += '?' + urllib.parse.urlencode({'error': 'Missing code in request'})
            self.send_response(302)
            self.send_header('Location', client_url)
            self.end_headers()
            return

        code = params['code'][0]
        print(f"Exchanging code {code} for access token...")
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
                print(f"Error: {res}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(res.encode('utf-8'))
                return

        # Encode the result in the redirect URL parameters
        client_url += '?' + urllib.parse.urlencode({'payload': res})
        # And encode the original URL parameters as well
        client_url += '&' + parsed_url.query
        print(f"Redirecting to {client_url}")
        # Send a 302 redirect response
        self.send_response(302)
        self.send_header('Location', client_url)
        self.end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    server = HTTPServer(('localhost', args.port), RedirectHandler)
    print(f"Listening on port {args.port}...")
    server.serve_forever()