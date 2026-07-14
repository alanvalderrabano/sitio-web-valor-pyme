#!/usr/bin/env python3
"""Servidor local que resuelve rutas limpias (/nosotros -> nosotros.html)."""
import http.server
import os
import socketserver

PORT = 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        translated = super().translate_path(path)
        # Si no existe y no es directorio, prueba agregando .html
        if not os.path.exists(translated) and not path.endswith('/'):
            html = translated + '.html'
            if os.path.exists(html):
                return html
        return translated


socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("127.0.0.1", PORT), CleanURLHandler) as httpd:
    print(f"Sirviendo en http://127.0.0.1:{PORT}")
    httpd.serve_forever()
