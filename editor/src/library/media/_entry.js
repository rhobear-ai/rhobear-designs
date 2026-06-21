/**
 * @file Internal test entry for the media library module.
 *
 *       Wired up as the `main` of src/library/media/package.json so that
 *       `node --test src/library/media/` (the test invocation the spec
 *       calls out) finds the suite by importing the directory's main.
 *       Importing here side-effect-registers the *.test.js file's tests,
 *       so the runner discovers them as subtests of this single import
 *       target.
 *
 *       Consumer-facing imports should use the `exports: { ".": "./index.js" }`
 *       map in package.json, which yields the clean public API
 *       (listMedia, getMedia, categories, gradients, buildSearchUrl, ...)
 *       without triggering test registration. Do NOT add this file to a
 *       barrel that consumers import directly.
 */

import './index.test.js';