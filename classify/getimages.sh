#!/bin/bash

find_images() {
  while read id; do
    # download image and resize
    url=$(grep "$id" all_images.csv | head -n1 | cut -d',' -f2 | tr -d '",')
    wget "https://snapshotserengeti.s3.msi.umn.edu/$url" -O images/$id.jpg
    convert -thumbnail '128x128!' images/$id.jpg images/$id.jpg
  done
}

test -e
mkdir images
wget https://datadryad.org/bitstream/handle/10255/dryad.76010/gold_standard_data.csv
wget https://datadryad.org/bitstream/handle/10255/dryad.86392/all_images.csv
# limit to single species, one individual in frame
head -n1 gold_standard_data.csv > testdata.csv
awk -F',' 'BEGIN {OFS=","} $2 == 1 && $4 == 1 { print }' gold_standard_data.csv >> testdata.csv
# go get em
cat testdata.csv | cut -d',' -f1 | tail -n+2 | find_images