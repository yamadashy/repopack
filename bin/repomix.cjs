#!/usr/bin/env node
'use strict';

const nodeVersion = process.versions.node;
const [major] = nodeVersion.split('.').map(Number);

const EXIT_CODES = {
  SUCCESS: 0,
  ERROR: 1,
};

if (major < 16) {
  console.error(`Repomix requires Node.js version 16 or higher. Current version: ${nodeVersion}\n`);
  process.exit(EXIT_CODES.ERROR);
}

function setupErrorHandlers() {
  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(EXIT_CODES.ERROR);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Promise Rejection:', reason);
    process.exit(EXIT_CODES.ERROR);
  });

  function shutdown() {
    process.exit(EXIT_CODES.SUCCESS);
  }

  process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Shutting down...');
    shutdown();
  });
  process.on('SIGTERM', shutdown);
}

async function main() {
  try {
    setupErrorHandlers();

    const { run } = await import('../lib/cli/cliRun.js');
    run();
  } catch (error) {
    console.error('Fatal Error:', error);
    process.exit(EXIT_CODES.ERROR);
  }
}

main();
