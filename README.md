# 📦 Repopack

[![npm](https://img.shields.io/npm/v/repopack.svg?maxAge=1000)](https://www.npmjs.com/package/repopack)
[![npm](https://img.shields.io/npm/l/repopack.svg?maxAge=1000)](https://github.com/yamadashy/repopack/blob/master/LICENSE.md)
[![node](https://img.shields.io/node/v/repopack.svg?maxAge=1000)](https://www.npmjs.com/package/repopack)

Repopack is a powerful tool that packs your entire repository into a single, AI-friendly file. Perfect for when you need to feed your codebase to Large Language Models (LLMs) or other AI tools.

## 🚀 Features

- **AI-Optimized**: Formats your codebase in a way that's easy for AI to understand and process.
- **Simple to Use**: Just one command to pack your entire repository.
- **Customizable**: Easily configure what to include or exclude.
- **Git-Aware**: Automatically respects your .gitignore files.

## 🛠 Installation

You can install Repopack globally using npm:

```bash
npm install -g repopack
```

Or if you prefer using Yarn:

```bash
yarn global add repopack
```

Alternatively, you can use npx to run Repopack without installing it:

```bash
npx repopack
```

## 📊 Usage

To pack your entire repository:

```bash
repopack
```

To pack specific files or directories:

```bash
repopack path/to/file1 path/to/directory
```

### Command Line Options

- `-o, --output <file>`: Specify the output file name
- `-i, --ignore <patterns>`: Additional ignore patterns (comma-separated)
- `-c, --config <path>`: Path to a custom config file
- `-v, --verbose`: Enable verbose logging

Examples:
```bash
repopack -o custom-output.txt
repopack -i "*.log,tmp" -v
repopack -c ./custom-config.json
npx repopack src tests
```

This will create a packed file containing the specified files or the entire repository.

## ⚙️ Configuration

Create a `repopack.config.json` file in your project root for custom configurations:

```json
{
  "output": {
    "filePath": "custom-output.txt",
    "headerText": "Custom header information for the packed file."
  },
  "ignore": {
    "useDefaultPatterns": true,
    "customPatterns": ["additional-folder", "*.log"]
  }
}
```

## 📄 Output Format

Repopack generates a single file with clear separators between different parts of your codebase:

```
================================================================
REPOPACK OUTPUT FILE
================================================================
(Metadata and usage instructions)

================================================================
Repository Files
================================================================

================
File: src/index.js
================
// File contents here

================
File: src/utils.js
================
// File contents here
```

This format ensures that AI tools can easily distinguish between different files in your codebase.

## 📜 License
MIT
