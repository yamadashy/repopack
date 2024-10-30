#!/usr/bin/env node

/*
Add this file so we can use `node bin/repomix` or `node bin/repomix.js`
instead of `node bin/repomix.cjs`.

This file should only used for development.
*/

'use strict';

import { run } from '../lib/cli/cliRun.js';

run();
