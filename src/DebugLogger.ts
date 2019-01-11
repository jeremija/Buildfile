import {debuglog} from 'util'

export class DebugLogger {

  public readonly logger: (msg: string, ...params: any[]) => void

  constructor(name: string) {
    this.logger = debuglog('buildfile:' + name)
  }

  log(msg: string, ...params: any[]) {
    this.logger(msg, ...params)
  }
}
