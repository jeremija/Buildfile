import assert from 'assert'
import {Command} from './Command'
import {EntryType} from './EntryType'
import {Entry} from './Entry'
import {IProgram} from './IProgram'
import {Program} from './Program'
import {Target} from './Target'

export class Parser {
  public readonly program = new Program()
  public firstTarget = ''

  parse(entries: Entry[]): IProgram {
    let target: Target | undefined = undefined
    entries.forEach(entry => {
      switch(entry.type) {
        case (EntryType.TARGET):
          target = new Target(entry.value)
          this.program.addTarget(target)
          break
        case (EntryType.DEPENDENCY):
          const dependency = entry.value
          assert.ok(
            target, 'A dependency must have a parent target: ' + dependency)
          target!.addDependency(dependency)
          break
        case (EntryType.COMMAND):
          const command = new Command(entry.value)
          assert.ok(target, 'A command must have a parent target: ' + command)
          target!.addCommand(command)
          break
      }
    })
    return this.program
  }
}

