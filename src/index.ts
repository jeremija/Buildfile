#!/usr/bin/env node
import {ArgumentParser} from './ArgumentParser'
import {Bootstrap} from './Bootstrap'
import {Compiler} from './Compiler'
import {DebugLogger} from './DebugLogger'
import {FileIterator} from './FileIterator'
import {ProgramExecutor} from './ProgramExecutor'
import {addNodeModulesToPath} from './addNodeModulesToPath'

const bootstrap = new Bootstrap()

export const argumentParser = new ArgumentParser([{
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
}, {
  name: 'd',
  alias: 'debug',
  description: 'Enable debug logging',
  type: 'flag',
  default: false,
}])

export async function main(args: string[]) {
  const parsed = argumentParser.parse(args)
  if (parsed.flags.help) {
    console.log('Usage: build [-p] <target1> [<target2> <target3> ...]')
    console.log(argumentParser.help())
    console.log('  -p, --parallel        Run targets in parallel\n')
  }

  DebugLogger.enableAll(!!parsed.flags.debug)
  bootstrap.debug = !!parsed.flags.debug

  const buildfile = parsed.flags.file as string
  const fileIterator = new FileIterator(buildfile)
  const compiler = new Compiler()
  const program = await compiler.compile(fileIterator, parsed.positional)

  if (parsed.flags.help) {
    console.log('Available targets: ' + program.targetNames.join(', '))
    return
  }

  addNodeModulesToPath()

  const executor = new ProgramExecutor()
  await executor.execute(program)
}

bootstrap.start(main, typeof require !== 'undefined' && require.main === module)
