import {Command} from './Command'
import {Entry} from './Entry'
import {Target} from './Target'
import {EntryType} from './EntryType'

export class Parser {
  public readonly targets: {[key: string]: Target} = {}
  public firstTarget = ''

  parse(entries: Entry[]) {
    let target: Target|undefined = undefined
    entries.forEach(entry => {
      switch(entry.type) {
        case (EntryType.TARGET):
          target = new Target(entry.value)
          this.registerTarget(target)
          break
        case (EntryType.COMMAND):
          let command = new Command(entry.value)
          if (!target) {
            throw new Error('A command must have a parent target:' + command)
          }
          target.addCommand(command)
          break
      }
    })
  }

  registerTarget(target: Target) {
    if (!this.firstTarget) {
      this.firstTarget = target.name
    }
    if (this.targets.hasOwnProperty(target.name)) {
      throw new Error('Target names must be unique: ' + target.name)
    }
    this.targets[target.name] = target
  }
}

