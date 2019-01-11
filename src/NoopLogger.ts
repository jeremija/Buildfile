import {ILogger} from './ILogger'

export class NoopLogger implements ILogger {
  log(message?: any, ...optionalParams: any[]) { /** noop */ }
  error(message?: any, ...optionalParams: any[]) { /** noop */ }
}
