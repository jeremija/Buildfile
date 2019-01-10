import {Entry} from './Entry'
import {EntryType} from './EntryType'
import {ICharacterIterator} from './ICharacterIterator'

export class Lexer {

  protected position = 0
  protected line = 1

  protected indent = 0
  protected value = ''

  public readonly entries: Entry[] = []

  constructor() {
  }

  async read(it: ICharacterIterator) {
    let c: string | null
    while ((c = await it.next()) !== null) {
      this.processToken(c)
    }
  }

  protected fail(message: string) {
    throw new Error(
      `[${this.line}, ${this.position}]: [${this.value}] ${message}`)
  }

  protected newLine() {
    this.line += 1
    this.position = 0
    this.value = ''
    this.indent = 0
  }

  protected processToken(c: string) {
    this.position += 1
    const value = this.value
    switch(c) {
      case '\r':
      case '\n':
        if (value === '') {
          this.newLine()
          return
        }
        if (this.indent === 0) {
          if (value.length > 1 && value.substring(value.length - 1) !== ':') {
            this.fail('Targets must end with a colon!')
            return
          }
          this.entries.push(
            new Entry(EntryType.TARGET, value.substring(0, value.length - 1)),
          )
          this.newLine()
          return
        }
        if (this.indent !== 2) {
          this.fail('Subcommands must be indented with 2 spaces!')
        }
        this.entries.push(new Entry(EntryType.COMMAND, value))
        this.newLine()
        return

      default:
        if (c === ' ') {
          if (value.length === 0) {
            this.indent += 1
            return
          }
          if (this.indent === 0) {
            this.fail('Target names cannot contain spaces')
          }
          this.value += c
          return
        }
        this.value += c
        return
    }
  }

}
