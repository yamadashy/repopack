# Coding Guidelines
- Follow the Airbnb JavaScript Style Guide
- Suggest splitting files into smaller, focused units when appropriate
- Add comments for non-obvious logic. Keep all text in English
- All new features should have corresponding unit tests

# Generate Comprehensive Output
- Include all content without abbreviation, unless specified otherwise
- Optimize for handling large codebases while maintaining output quality

# GitHub Release Note Guidelines
Here are some examples of release notes that follow the guidelines:

v0.1.40
````md
This release introduces improvements to file handling and output formatting, enhancing Repomix's functionality and user experience.

## Improvements

### Enhanced Markdown Support (#86, #95)

- Improved code block formatting in Markdown output:
  - Added language identifiers to code blocks for better syntax highlighting
  - Extended support for various file extensions to improve language detection
- Dynamic output file extension:
  - The extension of the output file now changes based on the selected style (e.g., `.md` for Markdown, `.xml` for XML)
  - This behavior only applies when no specific output file path is provided by the user

### Enhanced Exclusion of Package Manager Lock Files (#90, #94)

- Improved exclusion of common package manager lock files:
  - npm: `package-lock.json`
  - Yarn: `yarn.lock`
  - pnpm: `pnpm-lock.yaml`
  - These files are now automatically excluded from the packed output, including those in subdirectories

## How to Update

To update to the latest version, run:

```bash
npm update -g repomix
```

---

We value your feedback and contributions in making Repomix better! If you encounter any issues or have suggestions, please share them through our GitHub issues.
````

v0.1.38
````md
This release introduces a new Markdown output style, providing users with an additional option for formatting their repository content.

## What's New

### Markdown Output Style (#86, #87)

- Added new 'markdown' output style option
  - Users can now generate output in Markdown format, alongside existing plain text and XML options

## How to Use

To use the new Markdown output style, use the `--style markdown` option:

```bash
repomix --style markdown
```

Or update your `repomix.config.json`:

```json
{
  "output": {
    "style": "markdown"
  }
}
```

---

To update, simply run:
```bash
npm update -g repomix
```

As always, we appreciate your feedback and contributions to make Repomix even better! If you encounter any issues or have suggestions regarding this new feature, please let us know through our GitHub issues.
````

v0.1.36
````md
This release introduces a new configuration option that allows users to control the security check feature, providing more flexibility in how Repomix handles sensitive information detection.

## What's New

### Configurable Security Check (#74, #75)

- Added new configuration option `security.enableSecurityCheck` (default: `true`)
  - Users can now disable the security check when needed, such as when working with cryptographic libraries or known false positives

## How to Use

To **disable** the security check, add the following to your `repomix.config.json`:

```json
{
  "security": {
    "enableSecurityCheck": false
  }
}
```

**Note:** Disabling the security check may expose sensitive information. Use this option with caution and only when necessary.

---

To update, simply run:
```bash
npm update -g repomix
```

As always, we appreciate your feedback and contributions to make Repomix even better! If you encounter any issues or have suggestions regarding this new feature, please let us know through our GitHub issues.
````

v0.1.32
````md
This release focuses on improving performance and user experience, particularly when processing large repositories.

## Bug Fixes
###  Fixed an issue where the application appeared to hang (#63, #65)

- Fixed an issue where the application appeared to hang during the security check process on large repositories.
- Reduced the impact on the event loop to prevent hanging when processing a large number of files.
- Implemented more frequent console updates during file processing and security checks.

---
To update, simply run:
```
npm update -g repomix
```

As always, we appreciate your feedback and contributions to make Repomix even better!
````
