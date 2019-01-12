import {ConsoleLogger} from './ConsoleLogger'
import {ILogger} from './ILogger'

/**
 * Forwards output to stdout/stderr. This will be replaced with noopLogger in
 * tests.
 */
export let out: ILogger = new ConsoleLogger()

export function setLogger(l: ILogger) {
  out = l
}
