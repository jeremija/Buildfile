import {Command} from './Command'
import {Entry} from './Entry'
import {StringIterator} from './StringIterator'
import {VariableExpander} from './VariableExpander'

export class CommandFactory {

  constructor(protected readonly expander: VariableExpander) {}

  createFrom(entry: Entry): Command {
    const it = new StringIterator(entry.value)
    const value = this.expander.expand(it)
    return new Command(value)
  }

}
