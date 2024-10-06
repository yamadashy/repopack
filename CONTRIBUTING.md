# Contribution Guide

Contributions are welcome! We appreciate your help in making repopack better.
You can contribute in the following ways:

- Create an Issue - Propose a new feature or report a bug.
- Pull Request - Fix a bug, add a feature, or improve documentation.
- Share - Share your thoughts about repopack on blogs, social media, or in tech communities.
- Use repopack in your projects - Practical usage often leads to valuable feedback and improvements.

Note:
repopack is maintained by Yamadashy ([@yamadashy](https://github.com/yamadashy)). While we welcome contributions, please understand that not all suggestions may be accepted, especially if they don't align with the project's goals or coding style.

## Installing dependencies

The `yamadashy/repopack` project uses [npm](https://www.npmjs.com/) as its package manager. Developers should have Node.js and npm installed.

After that, please install the dependencies:

```bash
npm install
```

## Pull Requests

Before submitting a Pull Request, please ensure:

1. Your code passes all tests: Run `npm run test`
2. Your code adheres to our linting standards: Run `npm run lint`
3. You have updated relevant documentation (especially README.md) if you've added or changed functionality.

## Local Development

To set up Repopack for local development:

```bash
git clone https://github.com/yamadashy/repopack.git
cd repopack
npm install
```

To run Repopack locally:

```bash
npm run cli-run
```

## Coding Style

We use [Biome](https://biomejs.dev/) for linting and formatting. Please make sure your code follows the style guide by running:

```bash
npm run lint
```

## Testing

We use [Vitest](https://vitest.dev/) for testing. To run the tests:

```bash
npm run test
```

For test coverage:

```bash
npm run test-coverage
```

## Documentation

When adding new features or making changes, please update the relevant documentation in the README.md file.

## Releasing

Releasing new versions is handled by the project maintainer. If you believe a new release is needed, please open an issue to discuss it.

Thank you for contributing to Repopack!
