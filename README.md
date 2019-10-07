# Dedup

### Description
Removes duplicates based on provided rules.

## Prerequisites
1. Node 8.x
1. NPM

## Local Deployment
```bash
npm install
```

## Deduplicate a .json file
Pass file name in command line
- Two files are generated in the output_files directory (with and without logs)
- Logs contain all field change data
```bash
node dedup.js input.json
```

## Running Tests
```bash
jasmine
```
