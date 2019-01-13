import assert from 'assert'
import {ArrayIterator} from './ArrayIterator'
import {StringIterator} from './StringIterator'
import {CommandFactory} from './CommandFactory'
import {DebugLogger} from './DebugLogger'
import {EntryType} from './EntryType'
import {Entry} from './Entry'
import {Environment} from './Environment'
import {IProgram} from './IProgram'
import {Program} from './Program'
import {Target} from './Target'
import {VariableExpander} from './VariableExpander'
import {Wildcard} from './Wildcard'

const logger = new DebugLogger('parser')

interface IContext {
  it: ArrayIterator<Entry>,
  targets: string[],
  targetsSet: Set<string>,
  target?: Target
  isParallel: boolean
}

export class Parser {
  public readonly program = new Program()
  protected readonly commandFactory: CommandFactory
  protected readonly expander: VariableExpander

  constructor(protected readonly environment: Environment) {
    this.expander = new VariableExpander(environment)
    this.commandFactory = new CommandFactory(this.expander)
  }

  parse(entries: Entry[], targets: string[]): IProgram {
    const it = new ArrayIterator(entries)
    const ctx: IContext = {
      it,
      targetsSet: new Set(targets),
      targets,
      isParallel: false,
    }
    let entry: Entry | null
    while ((entry = it.next()) !== null) {
      const target = ctx.target!
      switch (entry.type) {
        case EntryType.TARGET:
          ctx.target = new Target(entry.value)
          logger.log('addTarget', entry.value)
          this.program.addTarget(ctx.target)
          break
        case (EntryType.DEPENDENCY):
          const dep = entry.value
          assert.ok(target, `A dependency must have a parent target: ${dep}`)
          if (dep.indexOf('*') === -1) {
            assert.ok(
              ctx.targetsSet.has(dep),
              `Target specified as dependency not found: "${dep}"`,
            )
            this.addDependency(ctx, dep)
            break
          }
          this.addWildcard(ctx, dep)
          break
        case EntryType.PARALLEL_FLAG:
          assert.ok(target,
            `A dependency must have a parent target: ${entry.value}`)
          logger.log('addGroup')
          target.addGroup()
          ctx.isParallel = true
          break
        case EntryType.COMMAND:
          const command = this.commandFactory.createFrom(entry)
          assert.ok(target, 'A command must have a parent target: ' + command)
          logger.log('addCommand: %s', command.value)
          target.addCommand(command)
          break
        case EntryType.VARIABLE_NAME:
          this.addVariable(ctx, entry)
      }
    }
    return this.program
  }

  protected addVariable(ctx: IContext, entry: Entry | null) {
    const name = entry!.value
    entry = ctx.it.next()!
    assert(entry &&
      (entry.type === EntryType.VARIABLE_EQUALS ||
      entry.type === EntryType.VARIABLE_IFNOT),
      'Expected variable set operator',
    )
    const operator = entry.type
    entry = ctx.it.next()!
    assert(
      entry && entry.type === EntryType.VARIABLE_VALUE,
      'Expected variable value',
    )
    const value = this.expander.expand(
      new StringIterator(entry!.value))

    logger.log('addVariable: %s %s %s', name, operator, value)
    if (
      operator === EntryType.VARIABLE_EQUALS ||
      (operator === EntryType.VARIABLE_IFNOT &&
      this.environment.get(name, '') === '')
    ) {
      this.environment.set(name, value)
    }
  }

  protected addDependency(
    ctx: IContext,
    dependency: string,
  ) {
    const target = ctx.target!
    if (!ctx.isParallel) {
      logger.log('addGroup')
      target.addGroup()
    }
    logger.log('addDependency: %s', target.name, dependency)
    target.addDependency(dependency)
  }

  protected addWildcard(
    ctx: IContext,
    dependency: string,
  ) {
    const target = ctx.target!
    logger.log('addWildcard: %s', target.name, dependency)
    for (const d of new Wildcard(dependency).match(ctx.targets)) {
      this.addDependency(ctx, d)
    }
  }
}
