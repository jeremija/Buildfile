import {Command} from './Command'

export class Target {
  public readonly commands: Command[] = []
  public readonly dependencies: string[] = []

  constructor(readonly name: string) {}

  addCommand(command: Command) {
    this.commands.push(command)
  }

  addDependency(name: string) {
    this.dependencies.push(name)
  }
}

