import {ICharacterIterator} from './ICharacterIterator'
import {IProgram} from './IProgram'
import {Lexer} from './Lexer'
import {Parser} from './Parser'

export class Compiler {
  constructor() {}

  async compile(it: ICharacterIterator): Promise<IProgram> {
    const lexer = new Lexer()
    await lexer.read(it)

    const parser = new Parser()
    return parser.parse(lexer.entries)
  }
}
