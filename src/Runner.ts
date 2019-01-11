import {Command} from './Command'
import {Target} from './Target'
import {StdioOptions, Subprocess} from './Subprocess'

export class Runner {

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
    return await new Subprocess(command.value, options).run()
  }

}
