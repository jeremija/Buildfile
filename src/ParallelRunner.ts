import {Runner} from './Runner'
import {Target} from './Target'

export class ParallelRunner extends Runner {
  async run(targets: Target[]): Promise<void> {
    await Promise.all(
      targets.map(async target => this.runTarget(target))
    )
  }
}
