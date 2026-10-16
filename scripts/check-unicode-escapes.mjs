#!/usr/bin/env bun
// Fails the build when Markdown content contains literal \uXXXX escape sequences.
//
// Why: Markdown does not interpret \uXXXX escapes. A file containing "\u2014"
// renders the raw text "\u2014" on the site instead of an em dash (—).
// Fenced code blocks are skipped so legitimate escapes in code samples
// (e.g. JSON examples) do not trigger the check.

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';

const ROOT = fileURLToPath(new URL('../src/content/docs/', import.meta.url));
const ESC_RE = /\\u([0-9a-fA-F]{4})/g;

async function walk(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (/\.(md|mdx)$/.test(e.name)) out.push(p);
  }
  return out;
}

// Drop lines inside ``` / ~~~ fenced code blocks.
function stripFences(text) {
  let inFence = false;
  return text
    .split('\n')
    .filter((line) => {
      if (/^\s*(```|~~~)/.test(line)) inFence = !inFence;
      return !inFence;
    })
    .join('\n');
}

const files = await walk(ROOT);
const problems = [];

for (const file of files) {
  const body = stripFences(await readFile(file, 'utf8'));
  for (const line of body.split('\n')) {
    let m;
    ESC_RE.lastIndex = 0;
    while ((m = ESC_RE.exec(line)) !== null) {
      problems.push(`${relative(ROOT, file)}: ${line.trim().slice(0, 90)}`);
    }
  }
}

if (problems.length > 0) {
  console.error(`✖ Found ${problems.length} literal \\uXXXX escape(s) in docs content:`);
  for (const p of problems) console.error(`  - ${p}`);
  console.error(
    "\nMarkdown does not interpret \\uXXXX escapes — write the actual character instead\n(e.g. use — instead of \\u2014, ' instead of \\u2019, → instead of \\u2192)."
  );
  process.exit(1);
}

console.log(`✓ Unicode escape check passed (${files.length} files scanned).`);
