import {ILogger} from './ILogger'
import {format} from 'util'

export class ConsoleLogger implements ILogger {
  constructor(
    public readonly stdout: NodeJS.WritableStream = process.stdout,
    public readonly stderr: NodeJS.WritableStream = process.stderr,
  ) {}

  log(message?: any, ...optionalParams: any[]) {
    this.stdout.write(format(message, ...optionalParams))
  }
  error(message?: any, ...optionalParams: any[]) {
    this.stderr.write(format(message, ...optionalParams))
  }
}
