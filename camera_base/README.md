# camera_base

Proof of concept to demonstrate reading images from the Camera Click board.

## Installation

Add the COMP3091 directory to the `feeds.conf.default` file in the creator-sdk
directory:

```
src-link COMP3091 /path/to/COMP3091
```

Then update feeds and make the package.

```
$ ./scripts/feeds update -a && ./scripts/feeds install -a

$ make package/camera_base/compile
```

Then copy the newly-created package file to the board and install with the `opkg` utility.

(and run)
