#!/usr/bin/env node

/*
Add this file so we can use `node bin/repopack` or `node bin/repopack.js`
instead of `node bin/repopack.cjs`.

This file should only used for development.
*/

'use strict';

import { run } from '../lib/cli/cliRunner.js';

run();
