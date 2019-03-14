import {Command} from './Command'
import {Entry} from './Entry'
import {StringIterator} from './StringIterator'
import {VariableExpander} from './VariableExpander'

export class CommandFactory {
  protected readonly stopChars = new Set([null])

  constructor(protected readonly expander: VariableExpander) {}

  createFrom(entry: Entry): Command {
    const it = new StringIterator(entry.value)
    const value = this.expander.expand(it, this.stopChars)
    return new Command(value)
  }

}
