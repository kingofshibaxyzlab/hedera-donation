#!/bin/bash

output_file="flatten.txt"
folder="worker"

> $output_file  # Clear the output file if it exists

# Find only .rs and .toml files, but exclude the ./target directory
for file in $(find $folder -type f \( -name "*.ts" -o -name "*.sh" -o -name "Dockerfile" \) ! -name "*.pyc" ); do
    echo "#### File path start: $file" >> $output_file
    cat "$file" >> $output_file
    echo "" >> $output_file
    echo "#### File path end: $file" >> $output_file
done
