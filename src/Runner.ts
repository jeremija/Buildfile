import {Command} from './Command'
import {Target} from './Target'
import {Subprocess} from './Subprocess'

export class Runner {
  constructor(public readonly parallel = false) {}

  async runInParallel(targets: Target[]) {
    await Promise.all(
      targets.map(async target => {
        for (let command of target.commands) {
          await this.runCommand(command)
        }
      }),
    )
  }

  async runInSeries(targets: Target[]) {
    for (let target of targets) {
      for (let command of target.commands) {
        await this.runCommand(command)
      }
    }
  }

  async runCommand(command: Command) {
    return await new Subprocess(command.value).run()
  }

  async runTargets(targets: Target[]) {
    if (this.parallel) {
      await this.runInParallel(targets)
    } else {
      await this.runInSeries(targets)
    }
  }

}
