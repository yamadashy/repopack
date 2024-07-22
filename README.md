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

To pack a specific directory:

```bash
repopack path/to/directory
```

Once you have generated the packed file, you can use it with Generative AI tools like Claude or ChatGPT.

### Prompt Examples

When using the packed file with AI tools, you can use prompts like these to start your conversation:

#### English

```
This file contains the contents of my repository combined into a single file. I'd like to refactor the code, so please review the code first.
```

#### Japanese

```
このファイルはリポジトリのファイルを1つにしたものです。コードのリファクタをしたいのでまずコードを確認してください。
```

### Command Line Options

- `-v, --version`: Show tool version
- `-o, --output <file>`: Specify the output file name
- `--top-files-len <number>`: Number of top files to display in the summary
- `-i, --ignore <patterns>`: Additional ignore patterns (comma-separated)
- `-c, --config <path>`: Path to a custom config file
- `--verbose`: Enable verbose logging

Examples:
```bash
repopack -o custom-output.txt
repopack -i "*.log,tmp" -v
repopack -c ./custom-config.json
npx repopack src
```



## ⚙️ Configuration

Create a `repopack.config.json` file in your project root for custom configurations. Here's an explanation of the configuration options:

| Option | Description | Default |
|--------|-------------|---------|
|`output.filePath`| The name of the output file | `"repopack-output.txt"` |
|`output.headerText`| Custom text to include in the file header |`null`|
|`output.removeComments`| Whether to remove comments from supported file types. Suppurts python  | `false` |
|`output.topFilesLength`| Number of top files to display in the summary |`5`|
|`ignore.useDefaultPatterns`| Whether to use default ignore patterns |`true`|
|`ignore.customPatterns`| Additional patterns to ignore |`[]`|

Example configuration:

```json
{
  "output": {
    "filePath": "repopack-output.txt",
    "headerText": "Custom header information for the packed file.",
    "removeComments": true
  },
  "ignore": {
    "useDefaultPatterns": true,
    "customPatterns": ["additional-folder", "*.log"]
  }
}
```

### Default Ignore Patterns

Repopack automatically ignores certain files and directories by default:

- All patterns specified in your project's `.gitignore` file
- Git-related files and directories (e.g., `.git`, `.gitattributes`)
- Binary files (e.g., images, executables)
- Common build output and dependency directories (e.g., `node_modules`, `dist`)
- System and IDE-specific files (e.g., `.DS_Store`, `.vscode`)

This ensures that only relevant source code is included in the packed file. You can add additional ignore patterns using the `ignore.customPatterns` configuration option or the `-i` command line flag.

### Comment Removal

When `output.removeComments` is set to `true`, Repopack will attempt to remove comments from supported file types. This feature can help reduce the size of the output file and focus on the essential code content.

Currently supported file types for comment removal:

- HTML (.html)
- CSS (.css, .scss, .sass)
- JavaScript, React (.js, .jsx)
- TypeScript (.ts, .tsx)
- Vue (.vue)
- Svelte (.svelte)
- Python (.py)
- PHP (.php)
- Ruby (.rb)
- C (.c)
- C# (.cs)
- Java (.java)
- Go (.go)
- Rust (.rs)
- Swift (.swift)
- Kotlin (.kt)
- Dart (.dart)
- Shell (.sh)
- YAML (.yml, .yaml)

Note: The comment removal process is designed to be conservative to avoid accidentally removing code. In some complex cases, especially with nested comments or language-specific peculiarities, some comments might be retained.



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
