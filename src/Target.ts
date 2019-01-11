import {Command} from './Command'
import {DependencyGroup} from './DependencyGroup'

export class Target {
  public readonly commands: Command[] = []
  public readonly dependencyGroups: DependencyGroup[] = [
    new DependencyGroup(),
  ]

  constructor(readonly name: string) {}

  addCommand(command: Command) {
    this.commands.push(command)
  }

  addGroup() {
    if (this.getDependencyGroup().targetNames.length === 0) {
      // do not create a new group if the current one is already empty
      return
    }
    const group = new DependencyGroup()
    this.dependencyGroups.push(group)
  }

  addDependency(targetName: string) {
    const dg = this.getDependencyGroup()
    dg.addTarget(targetName)
  }

  protected getDependencyGroup() {
    return this.dependencyGroups[this.dependencyGroups.length - 1]
  }

}
