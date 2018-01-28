import socket
from datetime import datetime

# listen for data and print it to STDOUT
listen_sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
listen_sock.bind(("::", 9876))

while True:
    data, addr_info = listen_sock.recvfrom(1024)
    body = data.decode("ascii")
    print("RX [{}] {}".format(datetime.utcnow().isoformat(), body))

print("Server terminated")
