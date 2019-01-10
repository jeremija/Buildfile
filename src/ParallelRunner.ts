import {Runner} from './Runner'
import {Target} from './Target'

export class ParallelRunner extends Runner {
  protected async execute(targets: Target[]): Promise<void> {
    await Promise.all(
      targets.map(async target => this.runTarget(target))
    )
  }
}
