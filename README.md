# @vuebro/fsa

A TypeScript library that provides a wrapper around the File System Access API, enabling web applications to interact with the user's local file system in a structured way. The library mimics AWS S3-like operations (get, put, delete, head) for files and directories.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Supported Browsers](#supported-browsers)
- [API](#api)
- [Usage](#usage)
- [Examples](#examples)
- [License](#license)

## Features

- AWS S3-like API interface for local file system access
- Get, put, delete, and head operations for files and directories
- Promise-based asynchronous operations
- Blob and text content handling
- Recursive directory navigation
- TypeScript support with comprehensive type definitions
- AGPL-3.0 licensed

## Installation

```bash
npm install @vuebro/fsa
```

## Supported Browsers

This library uses the File System Access API, which is currently supported in:
- Google Chrome (v86+)
- Microsoft Edge (v86+)
- Opera (v72+)

Note: Support in other browsers may vary. Check [caniuse.com](https://caniuse.com/native-filesystem-api) for the most current browser compatibility.

## API

The library provides the following functions:



### `deleteObject(Bucket, Key)`

Deletes an object from the file system

- `Bucket` - The root directory handle (`FileSystemDirectoryHandle`)
- `Key` - The path to the object to delete (string)
- Returns: Promise that resolves when the object is deleted

### `getObjectBlob(Bucket, Key)`

Gets an object as a Blob from the file system

- `Bucket` - The root directory handle (`FileSystemDirectoryHandle`)
- `Key` - The path to the object (string)
- Returns: Promise resolving to a Blob

### `getObjectText(Bucket, Key)`

Gets an object as text from the file system

- `Bucket` - The root directory handle (`FileSystemDirectoryHandle`)
- `Key` - The path to the object (string)
- Returns: Promise resolving to a string

### `headObject(Bucket, Key)`

Checks if an object exists in the file system

- `Bucket` - The root directory handle (`FileSystemDirectoryHandle`)
- `Key` - The path to the object (string)
- Returns: Promise that resolves to undefined if object exists, throws error if not

### `putObject(Bucket, Key, body)`

Puts an object into the file system

- `Bucket` - The root directory handle (`FileSystemDirectoryHandle`)
- `Key` - The path to store the object at (string)
- `body` - The content of the object (`StreamingBlobPayloadInputTypes`)
- Returns: Promise that resolves when the object is stored

### `removeEmptyDirectories(directory, exclude)`

Removes empty directories from the file system

- `directory` - The directory to process (`FileSystemDirectoryHandle`)
- `exclude` - Directories to exclude from removal (string[])
- Returns: Promise that resolves when the operation is complete

## Usage

First, you'll need to get a directory handle from the user using the File System Access API:

```javascript
import { 
  putObject, 
  getObjectText, 
  deleteObject, 
  headObject, 
  getObjectBlob,
  removeEmptyDirectories
} from '@vuebro/fsa';

// Get a directory handle from the user
const directoryHandle = await window.showDirectoryPicker();

// Example: Write content to a file
await putObject(directoryHandle, 'path/to/file.txt', 'Hello, world!');

// Example: Read file as text
const text = await getObjectText(directoryHandle, 'path/to/file.txt');
console.log(text); // Outputs: 'Hello, world!'

// Example: Read file as Blob
const blob = await getObjectBlob(directoryHandle, 'path/to/file.txt');
console.log(blob); // Outputs: Blob object

// Example: Check if a file exists
try {
  await headObject(directoryHandle, 'path/to/file.txt');
  console.log('File exists');
} catch (error) {
  console.log('File does not exist');
}

// Example: Delete a file
await deleteObject(directoryHandle, 'path/to/file.txt');



// Example: Remove empty directories (excluding specific ones)
await removeEmptyDirectories(directoryHandle, ['.git', 'node_modules']);
```

## Examples

### Working with nested directories

```javascript
// Create and write to a file in nested directories
await putObject(directoryHandle, 'folder1/folder2/folder3/file.txt', 'Content');

// Read from nested path
const content = await getObjectText(directoryHandle, 'folder1/folder2/folder3/file.txt');
```

### Reading files in different formats

```javascript
// As text
const textContent = await getObjectText(directoryHandle, 'file.txt');

// As Blob
const blobContent = await getObjectBlob(directoryHandle, 'file.txt');

// Converting Blob to other formats
const arrayBuffer = await (await getObjectBlob(directoryHandle, 'file.bin')).arrayBuffer();
const dataUrl = await (await getObjectBlob(directoryHandle, 'image.png')).text(); // Use proper method for data URLs
```

### Batch operations

```javascript
// Perform multiple operations
const operations = Promise.all([
  putObject(directoryHandle, 'file1.txt', 'Content 1'),
  putObject(directoryHandle, 'file2.txt', 'Content 2'),
  putObject(directoryHandle, 'file3.txt', 'Content 3')
]);

await operations;
```

## License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

The AGPL-3.0 license requires that if you modify this library and provide access to it over a network, you must also make the modified source code available under the same license.