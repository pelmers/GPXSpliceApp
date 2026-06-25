#!/usr/bin/env python3
# Super simple python server with 1 job: redirect all requests to the "gpxsplice://" schema

import argparse
import base64
import datetime
import json
import tempfile
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
SHARED_CLIENT_ID = os.environ.get('SHARED_CLIENT_ID')
SHARED_CLIENT_SECRET = os.environ.get('SHARED_CLIENT_SECRET')
THIS_DOMAIN = os.environ['THIS_DOMAIN']
ANALYTICS_API_KEY = os.environ['RYBBIT_API_KEY']
ANALYTICS_SITE_ID = "3"

STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
STRAVA_REVOKE_URL = 'https://www.strava.com/oauth/revoke'
ANALYTICS_TRACK_URL = 'https://rubber.pelmers.com/api/track'
TOKEN_LEDGER_PATH = os.environ.get(
    'TOKEN_LEDGER_PATH',
    '/app/data/strava_token_ledger.json'
)

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


def append_query(url, values):
    separator = '&' if '?' in url else '?'
    return url + separator + urllib.parse.urlencode(values)


def append_fragment(url, values):
    base, _, _fragment = url.partition('#')
    return base + '#' + urllib.parse.urlencode(values)


def should_use_fragment_callback(client_uri):
    parsed = urlparse(client_uri)
    return (
        parsed.scheme in ('http', 'https') and
        parsed.netloc in ('streetwarp.com', 'www.streetwarp.com')
    )


def append_client_callback_payload(client_uri, values, original_query=''):
    if should_use_fragment_callback(client_uri):
        return append_fragment(client_uri, values)
    client_uri = append_query(client_uri, values)
    if original_query:
        client_uri += '&' + original_query
    return client_uri


def strava_credentials_for_path(path):
    shared_prefix = '/shared/client_uri/'
    legacy_prefix = '/client_uri/'

    if path.startswith(shared_prefix):
        if not SHARED_CLIENT_ID or not SHARED_CLIENT_SECRET:
            raise RuntimeError('Shared Strava client is not configured')
        return (
            'shared',
            SHARED_CLIENT_ID,
            SHARED_CLIENT_SECRET,
            urllib.parse.unquote(path[len(shared_prefix):])
        )

    if path.startswith(legacy_prefix):
        return (
            'legacy',
            CLIENT_ID,
            CLIENT_SECRET,
            urllib.parse.unquote(path[len(legacy_prefix):])
        )

    return None


def utc_now():
    return datetime.datetime.now(datetime.timezone.utc)


def isoformat(dt):
    return dt.astimezone(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')


def parse_timestamp(value):
    if not value:
        return None
    try:
        return datetime.datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        return None


def token_ledger_template():
    return {
        'version': 1,
        'records': {}
    }


def load_token_ledger():
    path = TOKEN_LEDGER_PATH
    if not path:
        return token_ledger_template()
    try:
        with open(path, 'r') as f:
            ledger = json.load(f)
    except FileNotFoundError:
        return token_ledger_template()
    except json.JSONDecodeError as e:
        logging.error(f"Failed to parse token ledger {path}: {e}")
        return token_ledger_template()
    if 'records' not in ledger or not isinstance(ledger['records'], dict):
        ledger['records'] = {}
    return ledger


def save_token_ledger(ledger):
    path = TOKEN_LEDGER_PATH
    if not path:
        return
    directory = os.path.dirname(path)
    if directory:
        os.makedirs(directory, mode=0o700, exist_ok=True)
    fd, tmp_path = tempfile.mkstemp(prefix='.strava-token-ledger-', dir=directory or None)
    try:
        with os.fdopen(fd, 'w') as f:
            json.dump(ledger, f, indent=2, sort_keys=True)
            f.write('\n')
        os.chmod(tmp_path, 0o600)
        os.replace(tmp_path, path)
        os.chmod(path, 0o600)
    finally:
        try:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except OSError:
            pass


def client_label(client_uri):
    parsed = urlparse(client_uri)
    if parsed.scheme in ('http', 'https'):
        return parsed.netloc
    if parsed.scheme:
        return parsed.scheme
    return 'unknown'


def remember_token(credential_name, client_id, client_uri, scope, token_payload):
    athlete = token_payload.get('athlete') or {}
    athlete_id = athlete.get('id')
    refresh_token = token_payload.get('refresh_token')
    access_token = token_payload.get('access_token')
    if not athlete_id or not (refresh_token or access_token):
        logging.warning('Skipping token ledger write because Strava payload was incomplete')
        return

    now = isoformat(utc_now())
    key = f"{credential_name}:{athlete_id}"
    ledger = load_token_ledger()
    previous = ledger['records'].get(key, {})
    ledger['records'][key] = {
        'credential': credential_name,
        'client_id': str(client_id),
        'athlete_id': athlete_id,
        'athlete_name': ' '.join(
            part for part in [
                athlete.get('firstname', ''),
                athlete.get('lastname', '')
            ]
            if part
        ),
        'app': client_label(client_uri),
        'client_uri': client_uri,
        'scope': scope,
        'access_token': access_token,
        'refresh_token': refresh_token,
        'expires_at': token_payload.get('expires_at'),
        'first_authorized_at': previous.get('first_authorized_at', now),
        'last_authorized_at': now,
    }
    save_token_ledger(ledger)
    logging.info(
        f"Remembered Strava token for {credential_name} athlete_id={athlete_id} app={client_label(client_uri)} client_uri={client_uri}"
    )


def revoke_token(record):
    credential = record.get('credential')
    if credential == 'shared':
        client_id = SHARED_CLIENT_ID
        client_secret = SHARED_CLIENT_SECRET
    elif credential == 'legacy':
        client_id = CLIENT_ID
        client_secret = CLIENT_SECRET
    else:
        raise RuntimeError(f"Unknown credential {credential!r}")
    if not client_id or not client_secret:
        raise RuntimeError(f"Strava client credentials are missing for {credential}")

    token = record.get('refresh_token') or record.get('access_token')
    if not token:
        raise RuntimeError('Record has no token to revoke')
    token_type_hint = 'refresh_token' if record.get('refresh_token') else 'access_token'

    data = urllib.parse.urlencode({
        'token': token,
        'token_type_hint': token_type_hint,
    }).encode('ascii')
    auth = base64.b64encode(f"{client_id}:{client_secret}".encode('utf-8')).decode('ascii')
    req = urllib.request.Request(
        STRAVA_REVOKE_URL,
        data=data,
        method='POST',
        headers={
            'Authorization': f"Basic {auth}",
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    )
    with urllib.request.urlopen(req, timeout=10) as response:
        if response.status != 200:
            raise RuntimeError(f"Unexpected revoke status {response.status}")


def cleanup_token_ledger(
    max_age_days,
    credential='shared',
    dry_run=False,
    include_blipper=False
):
    ledger = load_token_ledger()
    cutoff = utc_now() - datetime.timedelta(days=max_age_days)
    revoked = 0
    candidates = 0

    for key, record in list(ledger['records'].items()):
        if credential != 'all' and record.get('credential') != credential:
            continue
        if not record.get('refresh_token') and not record.get('access_token'):
            continue
        if record.get('app') == 'blipper' and not include_blipper:
            continue
        authorized_at = parse_timestamp(record.get('last_authorized_at'))
        if not authorized_at or authorized_at > cutoff:
            continue
        candidates += 1
        athlete_id = record.get('athlete_id')
        app = record.get('app', 'unknown')
        if dry_run:
            print(f"would revoke athlete_id={athlete_id} app={app} credential={record.get('credential')}")
            continue
        try:
            revoke_token(record)
            record.pop('access_token', None)
            record.pop('refresh_token', None)
            record['revoked_at'] = isoformat(utc_now())
            record.pop('last_revoke_error', None)
            revoked += 1
            print(f"revoked athlete_id={athlete_id} app={app} credential={record.get('credential')}")
        except Exception as e:
            record['last_revoke_error'] = str(e)
            print(f"failed athlete_id={athlete_id} app={app} credential={record.get('credential')}: {e}")

    if not dry_run:
        save_token_ledger(ledger)
    print(f"candidates={candidates} revoked={revoked} dry_run={dry_run}")


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
        try:
            route = strava_credentials_for_path(parsed_url.path)
        except RuntimeError as e:
            self.handle_error(str(e))
            return
        if route is None:
            logging.error(f"Missing client_uri in request: {self.path}")
            self.send_response(400)
            self.end_headers()
            return

        credential_name, client_id, client_secret, client_uri = route
        if not client_uri:
            logging.error(f"Missing client URI in request: {self.path}")
            self.send_response(400)
            self.end_headers()
            return

        # Perform key exchange with the Strava API by sending the code with client id and secret
        if 'code' not in params:
            logging.error(f"Missing code in request: {self.path}")
            # Redirect back to client with error
            client_uri = append_client_callback_payload(
                client_uri,
                {'error': 'Missing code in request'}
            )
            self.send_response(302)
            self.send_header('Location', client_uri)
            self.end_headers()
            return

        code = params['code'][0]
        logging.info(f"Exchanging Strava code using {credential_name} client...")
        data = urllib.parse.urlencode({
            'client_id': client_id,
            'client_secret': client_secret,
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
                token_payload = json.loads(res)
        except Exception as e:
            self.handle_error(f"Error exchanging code for access token: {e}")
            return

        try:
            remember_token(
                credential_name,
                client_id,
                client_uri,
                ','.join(params.get('scope', [])),
                token_payload
            )
        except Exception as e:
            logging.error(f"Failed to remember Strava token: {e}")

        logging.info(f"Redirecting to {client_uri}")
        # Encode the result in the redirect URL parameters
        client_uri = append_client_callback_payload(
            client_uri,
            {'payload': res},
            parsed_url.query
        )
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
    subparsers = parser.add_subparsers(dest='command')

    serve_parser = subparsers.add_parser('serve')
    serve_parser.add_argument('--port', type=int, default=8000)

    cleanup_parser = subparsers.add_parser('cleanup')
    cleanup_parser.add_argument('--max-age-days', type=int, default=7)
    cleanup_parser.add_argument(
        '--credential',
        choices=['shared', 'legacy', 'all'],
        default='shared'
    )
    cleanup_parser.add_argument('--dry-run', action='store_true')
    cleanup_parser.add_argument(
        '--include-blipper',
        action='store_true',
        help='Also revoke Blipper athletes; by default Blipper is excluded.'
    )

    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()

    if args.command == 'cleanup':
        cleanup_token_ledger(
            args.max_age_days,
            args.credential,
            args.dry_run,
            args.include_blipper
        )
        raise SystemExit(0)

    port = args.port if args.command is None else args.port
    server = HTTPServer(('0.0.0.0', port), RedirectHandler)
    logging.info(f"Listening on port {port}...")
    server.serve_forever()
