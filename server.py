import http.server
import json
import os

PORT = 8000
DIRECTORY = "/Users/mohamed02/CoqueChic"

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _handle_get_api(self, filename):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        db_path = os.path.join(DIRECTORY, f'data/{filename}')
        if os.path.exists(db_path):
            with open(db_path, 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
        else:
            self.wfile.write(json.dumps([]).encode('utf-8'))

    def _handle_post_api(self, filename):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        db_path = os.path.join(DIRECTORY, f'data/{filename}')
        try:
            data = json.loads(post_data.decode('utf-8'))
            with open(db_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok"}).encode('utf-8'))
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))

    def do_GET(self):
        if self.path == '/api/products':
            self._handle_get_api('products.json')
        elif self.path == '/api/orders':
            self._handle_get_api('orders.json')
        elif self.path == '/api/messages':
            self._handle_get_api('messages.json')
        elif self.path == '/api/shipping':
            self._handle_get_api('shipping.json')
        elif self.path == '/api/settings':
            self._handle_get_api('settings.json')
        else:
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/products':
            self._handle_post_api('products.json')
        elif self.path == '/api/orders':
            self._handle_post_api('orders.json')
        elif self.path == '/api/messages':
            self._handle_post_api('messages.json')
        elif self.path == '/api/shipping':
            self._handle_post_api('shipping.json')
        elif self.path == '/api/settings':
            self._handle_post_api('settings.json')
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    os.makedirs(os.path.join(DIRECTORY, 'data'), exist_ok=True)
    server = http.server.HTTPServer(('0.0.0.0', PORT), MyHandler)
    print(f"Serving at http://localhost:{PORT}")
    server.serve_forever()
