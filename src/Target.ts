import {Command} from './Command'

export class Target {
  public readonly commands: Command[] = []

  constructor(readonly name: string) {}

  addCommand(command: Command) {
    this.commands.push(command)
  }
}

