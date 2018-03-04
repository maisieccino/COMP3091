#
# A very simple UDP server.
# Just listens to port 9876 and prints to STDOUT
# Plays nicely with `tee` as a result.
import signal
import socket
import sys
from datetime import datetime
import json

listen_sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
listen_sock.bind(("::", 9876))

device_pairs = {}


def command_id(obj):
    try:
        pair_id = obj["pair_id"]
    except KeyError:
        print("no pair_id provided")
        return
    try:
        device_id = obj["device_id"]
    except KeyError:
        print("no device_id provided")
        return
    try:
        device_type = obj["type"]
    except KeyError:
        print("no type provided")
        return
    print("device {} to be paired in pair {}".format(device_id, pair_id))
    if not pair_id in device_pairs:
        device_pairs[pair_id] = {}
    device_pairs[pair_id][device_type] = device_id
    print("device pair {}: now {}".format(pair_id, device_pairs[pair_id]))


def command_heartbeat(obj):
    print("device {} checking in".format(obj["device_id"]))


def quit_handler(signal, frame):
    print("Server terminating, goodbye")
    sys.exit(0)


signal.signal(signal.SIGINT, quit_handler)

listen_sock.listen(1)

while True:
    print('Waiting for a connection...')
    connection, client_address = listen_sock.accept()
    try:
        print("Connection from {}".format(client_address))
        while True:
            data = connection.recv(1024)
            try:
                obj = json.loads(data.decode("ascii"))
                print(obj)
                command_switch = {
                    "id": command_id,
                    "heartbeat": command_heartbeat
                }
                func = command_switch.get(
                    obj["command"], lambda: "Unknown command")
                func(obj)
            except json.JSONDecodeError:
                if len(data) == 0:
                    break
                print("RX [{}] {}".format(datetime.utcnow().isoformat(), data))
            except:
                print("Some random error: {}".format(sys.exc_info()[0]))
        else:
            print("No more data")
            break
    except ConnectionResetError:
        print("Connection lost.")
    finally:
        connection.close()
