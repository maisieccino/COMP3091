# System Pseudocode

## Ci40 base station - main application thread
```python

def rx6LowPAN():
    # receiving data (if any) from socket
    # also deal with it here
    if (socket.receive == True):
        data = socket.read
        command =  parseCommand()
        if (command.type == Image):
            processImage()

def tx6LowPAN(data):
# sending data (if any) to socket

def main:
    initialiseEventHandlers()
    open6lowpansocket()
    
    while not appicationCloseRequested():
        performHouseKeepingTasks()
        rx6LowPAN()
        tx6LoWPAN()

    removeEventHandlers()
    exit()
```
