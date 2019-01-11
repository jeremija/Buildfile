import {ILogger} from './ILogger'
import {format} from 'util'

export class ConsoleLogger implements ILogger {
  constructor(
    public readonly stdout: NodeJS.WritableStream = process.stdout,
    public readonly stderr: NodeJS.WritableStream = process.stderr,
  ) {}

  log(message?: any, ...optionalParams: any[]) {
    if (Buffer.isBuffer(message)) {
      this.stdout.write(message)
      return
    }
    this.stdout.write(format(message, ...optionalParams))
  }
  error(message?: any, ...optionalParams: any[]) {
    if (Buffer.isBuffer(message)) {
      this.stderr.write(message)
      return
    }
    this.stderr.write(format(message, ...optionalParams))
  }
}
