import assert from 'assert'
import {Command} from './Command'
import {DebugLogger} from './DebugLogger'
import {EntryType} from './EntryType'
import {Entry} from './Entry'
import {IProgram} from './IProgram'
import {Program} from './Program'
import {Target} from './Target'
import {Wildcard} from './Wildcard'

const logger = new DebugLogger('parser')

export class Parser {
  public readonly program = new Program()

  parse(entries: Entry[], targets: string[]): IProgram {
    const targetsSet = new Set(targets)
    let target: Target | undefined = undefined
    entries.forEach(entry => {
      switch(entry.type) {
        case (EntryType.TARGET):
          target = new Target(entry.value)
          logger.log('addTarget', entry.value)
          this.program.addTarget(target)
          break
        case (EntryType.DEPENDENCY):
          const dep = entry.value
          assert.ok(target, `A dependency must have a parent target: ${dep}`)
          if (dep.indexOf('*') === -1) {
            assert.ok(
              targetsSet.has(dep),
              `Target specified as dependency not found: "${dep}"`,
            )
            logger.log('addDependency: %s', dep)
            target!.addDependency(dep)
            break
          }
          logger.log('addWildcard: %s', dep)
          this.addWildcard(targets, target!, dep)
          break
        case (EntryType.PARALLEL_FLAG):
          assert.ok(target,
            `A dependency must have a parent target: ${entry.value}`)
          logger.log('addGroup')
          target!.addGroup()
          break
        case (EntryType.COMMAND):
          const command = new Command(entry.value)
          assert.ok(target, 'A command must have a parent target: ' + command)
          logger.log('addCommand: %s', command.value)
          target!.addCommand(command)
          break
      }
    })
    return this.program
  }

  protected addWildcard(
    targets: string[],
    target: Target,
    dependency: string,
  ) {
    for (let d of new Wildcard(dependency).match(targets)) {
      target.addDependency(d)
    }
  }
}

