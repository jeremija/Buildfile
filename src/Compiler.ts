import {Entry} from './Entry'
import {Environment} from './Environment'
import {ICharacterIterator} from './ICharacterIterator'
import {IProgram} from './IProgram'
import {Lexer} from './Lexer'
import {Parser} from './Parser'
import {StringIterator} from './StringIterator'

export class Compiler {

  constructor(protected readonly environment: Environment = new Environment()) {
  }

  compile(it: ICharacterIterator, args?: string[]): IProgram {
    const lexer = new Lexer(it)
    lexer.read()

    const entries = [...this.processPositionals(args), ...lexer.entries]

    const parser = new Parser(this.environment)
    return parser.parse(entries, lexer.targets)
  }

  protected processPositionals(args?: string[]): Entry[] {
    if (!(args && args.length)) {
      return []
    }
    // TODO extract main: into a constant
    const it = new StringIterator('main: ' + args.join(' '))
    const lexer = new Lexer(it)
    lexer.read()
    return lexer.entries
  }
}
