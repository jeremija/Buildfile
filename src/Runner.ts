import {Command} from './Command'
import {Target} from './Target'
import {Subprocess} from './Subprocess'

export class Runner {
  constructor() {}

  async run(targets: Target[]): Promise<void> {
    await Promise.all(
      targets.map(async target => this.runTarget(target))
    )
  }

  protected async runTarget(target: Target) {
    for (let command of target.commands) {
      await this.runCommand(command)
    }
  }

  private async runCommand(command: Command) {
    return await new Subprocess(command.value).run()
  }

}
