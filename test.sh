#!/bin/bash

# Idea is to get md5 hash of all files in the current directory then dataform format and again do the hash
# if hash changes then we know that the file has been modified by the format commant

# Get the md5 hash of all files in the current directory and put in a variable
hash1=$(find . -type f -exec md5sum {} \; | awk '{print $1}' | sort | md5sum | awk '{print $1}')

# Format all files in the current directory
dataform format

# Get the md5 hash of all files in the current directory and put in a variable
hash2=$(find . -type f -exec md5sum {} \; | awk '{print $1}' | sort | md5sum | awk '{print $1}')

# Compare the two hashes
if [ "$hash1" != "$hash2" ]; then
    echo "Files have been modified"
else
    echo "Files have not been modified"
fi
