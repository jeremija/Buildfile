import assert from 'assert'
import {IProgram} from './IProgram'
import {Target} from './Target'

export class Program implements IProgram {
  public mainTarget = ''
  public readonly targets: {[key: string]: Target} = {}
  public readonly targetNames: string[] = []

  addTarget(target: Target) {
    if (!this.mainTarget) {
      // the first target mentioned is the main target
      this.mainTarget = target.name
    }
    assert(
      !this.targets.hasOwnProperty(target.name),
      'Target names must be unique: ' + target.name,
    )
    this.targetNames.push(target.name)
    this.targets[target.name] = target
  }
}
