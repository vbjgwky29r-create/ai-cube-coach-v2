#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'

const textExts = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs',
  '.json', '.md', '.mdx', '.css', '.scss', '.sass', '.less',
  '.html', '.xml', '.yml', '.yaml', '.txt', '.env',
  '.sh', '.ps1', '.bat',
])

const textBasenames = new Set([
  'Dockerfile',
  '.gitignore',
  '.gitattributes',
  '.editorconfig',
  'AGENTS.md',
])

const decoder = new TextDecoder('utf-8', { fatal: true })

function isLikelyTextFile(filePath) {
  const base = path.basename(filePath)
  const ext = path.extname(filePath).toLowerCase()
  if (textBasenames.has(base)) return true
  if (textExts.has(ext)) return true
  if (base.startsWith('.env')) return true
  return false
}

function listFiles(stagedOnly) {
  if (!stagedOnly) {
    return execSync('git ls-files', { encoding: 'utf8' })
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function hasUtf8Bom(buf) {
  return buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf
}

function main() {
  const stagedOnly = process.argv.includes('--staged')
  const files = listFiles(stagedOnly).filter(isLikelyTextFile).filter((f) => existsSync(f))

  const invalid = []
  const bomFiles = []

  for (const file of files) {
    const buf = readFileSync(file)
    try {
      decoder.decode(buf)
    } catch {
      invalid.push(file)
      continue
    }
    if (hasUtf8Bom(buf)) {
      bomFiles.push(file)
    }
  }

  if (invalid.length > 0 || bomFiles.length > 0) {
    console.error('\n[check:utf8] UTF-8 validation failed.\n')
    if (invalid.length > 0) {
      console.error('Invalid UTF-8 files:')
      for (const file of invalid) console.error(`- ${file}`)
    }
    if (bomFiles.length > 0) {
      console.error('\nUTF-8 BOM files (please save without BOM):')
      for (const file of bomFiles) console.error(`- ${file}`)
    }
    process.exit(1)
  }

  console.log(`[check:utf8] OK (${files.length} file(s) checked${stagedOnly ? ', staged only' : ''}).`)
}

main()
