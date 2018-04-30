from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import numpy as np
import tensorflow as tf
import time
import csv
import sys

species = [
    "aardvark",
    "aardwolf",
    "baboon",
    "buffalo",
    "bushbuck",
    "cheetah",
    "dikDik",
    "eland",
    "elephant",
    "gazelleGrants",
    "gazelleThomsons",
    "giraffe",
    "guineaFowl",
    "hartebeest",
    "hippopotamus",
    "human",
    "hyenaSpotted",
    "impala",
    "jackal",
    "koriBustard",
    "leopard",
    "lionFemale",
    "lionMale",
    "mongoose",
    "ostrich",
    "otherBird",
    "porcupine",
    "reedbuck",
    "rhinoceros",
    "secretaryBird",
    "serval",
    "topi",
    "vervetMonkey",
    "warthog",
    "waterbuck",
    "wildebeest",
    "zebra",
]


def load_data():
    files = []
    ys = []
    with open("testdata.csv", newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            files.append("images/{}.jpg".format(row["CaptureEventID"]))
            ys.append(row["Species"])
    return files, ys


def main(argv):
    classes = len(species)
    filenames, ys = load_data()
    filename_queue = tf.train.string_input_producer(filenames)
    reader = tf.WholeFileReader()
    key, value = reader.read(filename_queue)
    image = tf.image.decode_jpeg(value, channels=3)

    images_placeholder = tf.placeholder(tf.float32, shape=[None, 128*128*3])
    labels_placeholder = tf.placeholder(tf.int64, shape=[None])

    weights = tf.Variable(tf.zeros([128*128*3, classes]))
    biases = tf.Variable(tf.zeros([classes]))

    with tf.Session() as sess:
        tf.local_variables_initializer().run()
        coord = tf.train.Coordinator()
        threads = tf.train.start_queue_runners(coord=coord)

        coord.request_stop()
        coord.join(threads)


if __name__ == "__main__":
    main(sys.argv)
