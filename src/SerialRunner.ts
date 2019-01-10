import {Runner} from './Runner'
import {Target} from './Target'

export class SerialRunner extends Runner {
  async run(targets: Target[]): Promise<void> {
    for (let target of targets) {
      await this.runTarget(target)
    }
  }
}
