import {ILogger} from './ILogger'
import {format} from 'util'

export class ConsoleLogger implements ILogger {
  constructor(
    public readonly stdout: NodeJS.WritableStream = process.stdout,
    public readonly stderr: NodeJS.WritableStream = process.stderr,
  ) {}

  protected write(
    stream: NodeJS.WritableStream,
    message: any,
    optionalParams: any[],
  ) {
    if (Buffer.isBuffer(message)) {
      stream.write(message)
      return
    }
    stream.write(format(message, ...optionalParams))
    stream.write('\n')
  }

  log(message?: any, ...optionalParams: any[]) {
    this.write(this.stdout, message, optionalParams)
  }

  error(message?: any, ...optionalParams: any[]) {
    this.write(this.stderr, message, optionalParams)
  }
}
