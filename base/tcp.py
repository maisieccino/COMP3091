import socket
import sys

sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)

sock.bind(("::", 9876))

sock.listen(1)

while True:
    print('Waiting for a connection...')
    connection, client_address = sock.accept()
    try:
        print("Connection from {}".format(client_address))
        while True:
            data = connection.recv(1024)
            print("Received {}".format(data))
        else:
            print("No more data")
            break
    finally:
        connection.close()
