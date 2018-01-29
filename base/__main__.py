#
# A very simple UDP server.
# Just listens to port 9876 and prints to STDOUT
# Plays nicely with `tee` as a result.
import signal
import socket
import sys
from datetime import datetime

listen_sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
listen_sock.bind(("::", 9876))

def quit_handler(signal, frame):
    print("Server terminating, goodbye")
    sys.exit(0)

signal.signal(signal.SIGINT, quit_handler)

while True:
    data, addr_info = listen_sock.recvfrom(1024)
    print("RX [{}] {}".format(datetime.utcnow().isoformat(), data))
