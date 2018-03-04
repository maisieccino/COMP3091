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

# Maps device ids to their pair ids
device_ids_to_pairs = {}


def command_id(obj, conn):
    try:
        pair_id = obj["pair_id"]
        device_id = obj["device_id"]
        device_type = obj["type"]
    except KeyError:
        print("missing keys. make sure `pair_id`, `device_id` and `type` are provided.")
        return
    print("device {} to be paired in pair {}".format(device_id, pair_id))
    if not pair_id in device_pairs:
        device_pairs[pair_id] = {}
    if not device_id in device_ids_to_pairs:
        device_ids_to_pairs[device_id] = device_id
    device_pairs[pair_id][device_type] = device_id
    print("device pair {}: now {}".format(pair_id, device_pairs[pair_id]))


def command_heartbeat(obj, conn):
    print("device {} checking in".format(obj["device_id"]))


def command_motion(obj, conn):
    try:
        device_id = obj["device_id"]
    except KeyError:
        print("Missing device_id")
        return
    print("registered motion on device {}".format(device_id))
    if device_id in device_ids_to_pairs:
        pair_id = device_ids_to_pairs[device_id]
        if not "camera" in device_pairs[pair_id]:
            print("No camera associated with this pair. no further action.")
            return
        camera_id = device_pairs[pair_id]["camera"]
        print("sending capture command to device {}".format(camera_id))
        return


def command_unknown(obj, conn):
    print("Unknown command `{}`".format(obj["command"]))
    conn.send("what?!\n".encode())


def quit_handler(signal, frame):
    print("Server terminating, goodbye")
    sys.exit(0)


signal.signal(signal.SIGINT, quit_handler)

listen_sock.listen(1)

while True:
    print('Waiting for a connection...')
    conn, client_address = listen_sock.accept()
    try:
        print("Connection from {}".format(client_address))
        while True:
            data = conn.recv(1024)
            try:
                obj = json.loads(data.decode("ascii"))
                print(obj)
                command_switch = {
                    "id": command_id,
                    "heartbeat": command_heartbeat,
                    "motion": command_motion
                }
                func = command_switch.get(obj["command"], command_unknown)
                func(obj, conn)
            except json.JSONDecodeError:
                if len(data) == 0:
                    break
                print("RX [{}] {}".format(datetime.utcnow().isoformat(), data))
            except:
                print("Some random error: {}".format(sys.exc_info()[0]))
                raise
        else:
            print("No more data")
            break
    except ConnectionResetError:
        print("Connection lost.")
    finally:
        conn.close()
