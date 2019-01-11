import assert from 'assert'
import {ConsoleLogger} from './ConsoleLogger'
import {NoopLogger} from './NoopLogger'
import {ILogger} from './ILogger'

const consoleLogger = new ConsoleLogger()
const noopLogger = new NoopLogger()

export class DebugLogger implements ILogger {

  static readonly loggers: {[key: string]: DebugLogger} = {}
  static enabled = false

  static enable(name: string | string[]) {
    if (typeof name === 'string') {
      name = [name]
    }
    name.forEach(n => this.loggers[n].enable())
  }

  static disable(name: string | string[]) {
    if (typeof name === 'string') {
      name = [name]
    }
    name.forEach(n => this.loggers[n].disable())
  }

  static getLogger(name: string) {
    if (this.loggers.hasOwnProperty(name)) {
      return this.loggers[name]
    }
    const logger = this.loggers[name] = new DebugLogger(name)
    return logger
  }

  static enableAll(enable = true) {
    if (!enable) {
      this.disableAll()
      return
    }
    this.enabled = true
    this.enable(Object.keys(this.loggers))
  }

  static disableAll() {
    this.enabled = false
    this.disable(Object.keys(this.loggers))
  }

  protected logger: ILogger

  constructor(readonly name: string) {
    this.logger = DebugLogger.enabled ? consoleLogger : noopLogger
    assert(!DebugLogger.loggers.hasOwnProperty(name),
      `A logger with "${name}" already exists`)
    DebugLogger.loggers[name] = this
  }

  log(msg: string, ...params: any[]) {
    this.logger.log(msg + '\n', ...params)
  }

  error(msg: string, ...params: any[]) {
    this.logger.error(msg + '\n', ...params)
  }

  enable() {
    this.logger = consoleLogger
  }

  disable() {
    this.logger = noopLogger
  }

  isEnabled() {
    return this.logger !== noopLogger
  }

}
