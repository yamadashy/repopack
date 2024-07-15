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
- **Verbose Mode**: Detailed logging for debugging and understanding the packing process.

## 🛠 Installation

```bash
npm install -g repopack
```

Or if you prefer using Yarn:

```bash
yarn global add repopack
```

## 📊 Usage

Navigate to your project directory and run:

```bash
repopack
```

This will create a `repopack-output.txt` file containing your entire codebase.

### Command Line Options

- `-o, --output <file>`: Specify the output file name (default: repopack-output.txt)
- `-i, --ignore <items>`: Comma-separated list of additional items to ignore
- `-c, --config <path>`: Path to a custom config file (default: repopack.config.js)
- `--no-default-ignore`: Disable the default ignore list
- `-v, --verbose`: Enable verbose logging

Example:
```bash
repopack -o custom-output.txt -i "*.log,tmp" -v
```

## ⚙️ Configuration

Create a `repopack.config.js` file in your project root for custom configurations:

```javascript
/** @type {import('repopack').RepopackConfig} */
const config = {
  output: {
    filePath: 'custom-output.txt',
    headerText: 'Custom header information for the packed file',
  },
  ignore: {
    useDefaultPatterns: true,
    customPatterns: ['additional-folder', '*.log'],
  },
};

export default config;
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
