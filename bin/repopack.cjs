#!/usr/bin/env node
'use strict';

(async () => {
  const { run } = await import('../lib/cli/cliRunner.js');
  run();
})();
