import {Entry} from './Entry'
import {ICharacterIterator} from './ICharacterIterator'
import {IProgram} from './IProgram'
import {Lexer} from './Lexer'
import {Parser} from './Parser'
import {StringIterator} from './StringIterator'

export class Compiler {
  constructor() {}

  async compile(
    it: ICharacterIterator,
    args?: string[],
  ): Promise<IProgram> {
    const lexer = new Lexer(it)
    await lexer.read()

    const entries = [...await this.processPositionals(args), ...lexer.entries]

    const parser = new Parser()
    return parser.parse(entries, lexer.targets)
  }

  protected async processPositionals(args?: string[]): Promise<Entry[]> {
    if (!(args && args.length)) {
      return []
    }
    // TODO extract main: into a constant
    const it = new StringIterator('main: ' + args.join(' '))
    const lexer = new Lexer(it)
    await lexer.read()
    return lexer.entries
  }
}
