#
# A very simple UDP server.
# Just listens to port 9876 and prints to STDOUT
# Plays nicely with `tee` as a result.
import signal
import socket
import sys
from datetime import datetime
import json

listen_sock = socket.socket(socket.AF_INET6, socket.SOCK_DGRAM)
listen_sock.bind(("::", 9876))

device_pairs = {}


def command_id(obj):
    pair_id = obj["pair_id"]
    device_id = obj["device_id"]
    print("device {} to be paired in pair {}".format(device_id, pair_id))
    if not device_id in device_pairs:
        device_pairs[pair_id] = {}
    device_pairs[pair_id][obj["type"]] = device_id
    print("device pair {}: now {}".format(pair_id, device_pairs[pair_id]))

def command_heartbeat(obj):
    print("device {} checking in".format(obj["device_id"]))

def quit_handler(signal, frame):
    print("Server terminating, goodbye")
    sys.exit(0)


signal.signal(signal.SIGINT, quit_handler)

while True:
    data, addr_info = listen_sock.recvfrom(1024)
    try:
        obj = json.loads(data.decode("ascii"))
        print(obj)
        command_switch = {
            "id": command_id,
            "heartbeat": command_heartbeat
        }
        func = command_switch.get(obj["command"], lambda: "Unknown command")
        func(obj)
    except json.JSONDecodeError:
        print("RX [{}] {}".format(datetime.utcnow().isoformat(), data))


