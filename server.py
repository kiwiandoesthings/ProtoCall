import http.server
import ssl

serverAddress = ('localhost', 8000)
httpd = http.server.HTTPServer(serverAddress, http.server.SimpleHTTPRequestHandler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain(certfile='server.pem', keyfile='server.key')
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print("Server running at https://localhost:8000")
httpd.serve_forever()