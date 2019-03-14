#!/usr/bin/env node
import {ArgumentParser} from './ArgumentParser'
import {Bootstrap} from './Bootstrap'
import {Compiler} from './Compiler'
import {DebugLogger} from './DebugLogger'
import {Environment} from './Environment'
import {FileIterator} from './FileIterator'
import {ProgramExecutor} from './ProgramExecutor'
import {out} from './config'

export const bootstrap = new Bootstrap()

export const argumentParser = new ArgumentParser([{
  name: 'C',
  alias: 'directory',
  description: 'Change directory',
  type: 'string',
  default: '',
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
}, {
  name: 'd',
  alias: 'debug',
  description: 'Enable debug logging',
  type: 'flag',
  default: false,
}, {
  name: 'v',
  alias: 'version',
  description: 'Print version and exit',
  type: 'flag',
  default: false,
}])

export async function main(args: string[]) {
  const parsed = argumentParser.parse(args)
  if (parsed.flags.version) {
    const pkg = require('../package.json')
    out.log('%s %s', pkg.name, pkg.version)
    return
  }

  if (parsed.flags.help) {
    out.log('Usage: build [-p] <target1> [<target2> <target3> ...]')
    out.log(argumentParser.help())
    out.log('  -p, --parallel        Run targets in parallel\n')
  }

  if (parsed.flags.directory) {
    out.log('chdir: ' + parsed.flags.directory)
    process.chdir(parsed.flags.directory as string)
  }

  DebugLogger.enableAll(!!parsed.flags.debug)
  bootstrap.debug = !!parsed.flags.debug

  const buildfile = parsed.flags.file as string
  const environment = new Environment({
    ...process.env,
    ...parsed.variables,
  })
  const compiler = new Compiler(environment)
  const fileIterator = await new FileIterator(buildfile).open()
  const program = compiler.compile(fileIterator, parsed.positional)

  if (parsed.flags.help) {
    out.log('Available targets: ' + program.targetNames.join(', '))
    return
  }

  const executor = new ProgramExecutor(environment)
  await executor.execute(program)
}

bootstrap.start(main, typeof require !== 'undefined' && require.main === module)
