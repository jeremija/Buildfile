#!/usr/bin/env node
import * as path from 'path'
import {FileIterator} from './FileIterator'
import {Compiler} from './Compiler'
import {ProgramExecutor} from './ProgramExecutor'
import {addNodeModulesToPath} from './addNodeModulesToPath'

export async function main(args: string[]) {
  const isHelp = args[0] === '-h' || args[0] === '--help'
  if (isHelp) {
    console.log('Usage: build [-p] <target1> [<target2> <target3> ...]')
  }

  const fi = new FileIterator(path.join(process.cwd(), 'Buildfile'))
  const compiler = new Compiler()
  const program = await compiler.compile(fi)

  if (isHelp) {
    console.log('Available targets: ' + program.targetNames.join(', '))
    return
  }

  addNodeModulesToPath()

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
