import assert from 'assert'
import {Command} from './Command'
import {Target} from './Target'
import {Subprocess} from './Subprocess'
import {IProgram} from './IProgram'

export abstract class Runner {
  constructor() {}

  protected abstract async execute(targets: Target[]): Promise<void>

  protected async runTarget(target: Target) {
    for (let command of target.commands) {
      await this.runCommand(command)
    }
  }

  private async runCommand(command: Command) {
    return await new Subprocess(command.value).run()
  }

  private async runTargets(targets: Target[]) {
    await this.execute(targets)
  }

  async run(program: IProgram, targets: string[] = []) {
    if (!targets.length) {
      targets = [program.mainTarget]
    }

    const selectedTargets = targets.map(t => {
      assert.ok(
        program.targets.hasOwnProperty(t),
        `Unknown target: ${t}`,
      )
      return program.targets[t]
    })
    this.runTargets(selectedTargets)
  }

}
