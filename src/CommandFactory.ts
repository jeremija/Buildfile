import {Command} from './Command'
import {Entry} from './Entry'
import {Environment} from './Environment'
import {StringIterator} from './StringIterator'
import {VariableExpander} from './VariableExpander'

export class CommandFactory {

  protected readonly expander: VariableExpander

  constructor(protected readonly environment: Environment) {
    this.expander = new VariableExpander(environment)
  }

  createFrom(entry: Entry): Command {
    const it = new StringIterator(entry.value)
    const value = this.expander.expand(it)
    return new Command(value)
  }

}
