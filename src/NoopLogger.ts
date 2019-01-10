import {ILogger} from './ILogger'

export class NoopLogger implements ILogger {
  constructor() {}

  log(message?: any, ...optionalParams: any[]) {}
  error(message?: any, ...optionalParams: any[]) {}
}
