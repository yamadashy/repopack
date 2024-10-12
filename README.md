# 📦 Repopack

![Actions Status](https://img.shields.io/badge/actions-🚀-success) ![npm](https://img.shields.io/badge/npm-📦-blue) ![node](https://img.shields.io/badge/node-🌳-green)

**Repopack** is a powerful tool that packs your entire repository into a single, AI-friendly file. It's perfect for when you need to feed your codebase to Large Language Models (LLMs) or other AI tools like Claude, ChatGPT, and Gemini.

## 📋 Table of Contents
- [🌟 Features](#features)
- [🚀 Quick Start](#quick-start)
- [📊 Usage](#usage)
- [💡 Prompt Examples](#prompt-examples)
- [📄 Output File Format](#output-file-format)
- [⚙️ Command Line Options](#command-line-options)
- [🔄 Updating Repopack](#updating-repopack)
- [🛠️ Configuration](#configuration)
- [📂 Include and Ignore](#include-and-ignore)
- [📄 Custom Instruction](#custom-instruction)
- [🚫 Comment Removal](#comment-removal)
- [🔍 Security Check](#security-check)
- [🤝 Contribution](#contribution)
- [📜 License](#license)

## 🌟 Features
- **AI-Optimized**: Formats your codebase in a way that's easy for AI to understand and process.
- **Token Counting**: Provides token counts for each file and the entire repository, useful for LLM context limits.
- **Simple to Use**: One command packs your entire repository.
- **Customizable**: Easily configure what to include or exclude.
- **Git-Aware**: Automatically respects your `.gitignore` files.
- **Security-Focused**: Incorporates Secretlint for robust security checks to detect and prevent the inclusion of sensitive information.

## 🚀 Quick Start
You can try Repopack instantly in your project directory without installation:

```bash
npx repopack

# Install using npm
npm install -g repopack

# Alternatively using yarn
yarn global add repopack

# Alternatively using Homebrew (macOS)
brew install repopack
