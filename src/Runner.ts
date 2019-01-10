import {Command} from './Command'
import {Target} from './Target'
import {Subprocess} from './Subprocess'

export abstract class Runner {
  constructor() {}

  abstract async run(targets: Target[]): Promise<void>

  protected async runTarget(target: Target) {
    for (let command of target.commands) {
      await this.runCommand(command)
    }
  }

  private async runCommand(command: Command) {
    return await new Subprocess(command.value).run()
  }

}
