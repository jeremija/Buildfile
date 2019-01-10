#!/usr/bin/env node
import {FileIterator} from './FileIterator'
import {Compiler} from './Compiler'
import {ProgramExecutor} from './ProgramExecutor'
import {addNodeModulesToPath} from './addNodeModulesToPath'
import {ArgumentParser} from './ArgumentParser'

export const argumentParser = new ArgumentParser([{
  name: 'p',
  alias: 'parallel',
  description: 'Run in parallel',
  type: 'string',
  default: false,
}, {
  name: 'f',
  alias: 'file',
  description: 'Buildfile to use',
  type: 'string',
  default: 'Buildfile',
}, {
  name: 'h',
  alias: 'help',
  description: 'Help',
  type: 'flag',
  default: false,
}])

export async function main(args: string[]) {
  const parsed = argumentParser.parse(args)
  if (parsed.flags.help) {
    console.log('Usage: build [-p] <target1> [<target2> <target3> ...]')
    console.log(argumentParser.help())
  }

  const buildfile = parsed.flags.file as string
  const fileIterator = new FileIterator(buildfile)
  const compiler = new Compiler()
  const program = await compiler.compile(fileIterator)

  if (parsed.flags.help) {
    console.log('Available targets: ' + program.targetNames.join(', '))
    return
  }

  addNodeModulesToPath()

  args = parsed.positional
  if (parsed.flags.parallel) {
    // special target, executes build in parallel
    args = ['-p', ...args]
  }

  const executor = new ProgramExecutor()
  await executor.execute(program, args)
}

if (require.main === module) {
  main(process.argv.slice(2))
  .then(() => process.exit(0))
  .catch(err => {
    console.error('! ', err.stack)
    process.exit(1)
  })
}
