import {Command} from './Command'
import {Environment} from './Environment'
import {StdioOptions, Subprocess} from './Subprocess'
import {Target} from './Target'

export class Runner {

  constructor(public readonly environment: Environment) {
  }

  async run(targets: Target[]): Promise<void> {
    const isSingle = targets.length === 1
    await Promise.all(
      targets.map(async target => this.runTarget(target, isSingle)),
    )
  }

  protected async runTarget(target: Target, isSingle: boolean) {
    for (const command of target.commands) {
      await this.runCommand(command, isSingle)
    }
  }

  private async runCommand(command: Command, isSingle: boolean) {
    const options = isSingle ? StdioOptions.INHERIT : StdioOptions.PIPE
    return await new Subprocess(command.value, this.environment, options).run()
  }

}
