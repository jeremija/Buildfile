#!/usr/bin/env node
import assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

export function getPathSeparator(platform: string) {
  return platform === 'win32' ? ';' : ':'
}

export async function main(args: string[]) {
  const isHelp = args[0] === '-h' || args[0] === '--help'
  if (isHelp) {
    console.log('Usage: build [-p] <target1> [<target2> <target3> ...]')
  }

  const file = path.join(process.cwd(), 'Buildfile')
  const readable = fs.createReadStream(file)
  const lexer = new Lexer()
  await lexer.read(readable)
  const parser = new Parser()
  parser.parse(lexer.entries)
  const targets = parser.targets

  if (isHelp) {
    console.log('Available targets: ' + Object.keys(targets).join(', '))
    return
  }

  const parallel = args[0] === '-p'
  if (parallel) {
    args = args.slice(1)
  }

  if (!args.length && parser.firstTarget) {
    args = [parser.firstTarget]
  }

  const targetsToRun = args.map(target => {
    assert(targets.hasOwnProperty(target), 'Unknown target: ' + target)
    return targets[target]
  })

  const nodeModulesDir = findNodeModules(process.cwd())
  if (nodeModulesDir) {
    const separator = getPathSeparator(os.platform())
    process.env.PATH = `${nodeModulesDir}${separator}${process.env.PATH}`
  }

  await runTargets(targetsToRun)
}

if (require.main === module) {
  main(process.argv.slice(2))
  .then(() => process.exit(0))
  .catch(err => {
    // console.error('!!! ', err.message)
    console.error('!!! ', err.stack)
    process.exit(1)
  })
}
