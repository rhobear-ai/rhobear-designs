/**
 * @file Internal test entry for the element-library module.
 *
 *       Wired up as the `main` of `package.json` so that
 *       `node --test src/library/elements/` (the test invocation the
 *       spec calls out) finds the suite by importing this file as the
 *       directory's "main". Importing here side-effect-registers every
 *       *.test.js file's tests, so the runner discovers them as
 *       subtests of this single import target.
 *
 *       Consumer-facing imports should use the
 *       `exports: { ".": "./index.js" }` map in package.json, which
 *       yields the clean public API without triggering test
 *       registration. Do NOT add this file to a barrel that consumers
 *       import directly.
 *
 *       Run with: `cd editor && node --test src/library/elements/`
 */

import './index.test.js';