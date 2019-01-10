import {Entry} from './Entry'
import {EntryType} from './EntryType'
import {ICharacterIterator} from './ICharacterIterator'

export class Lexer {

  protected position = 0
  protected line = 1
  protected lastChar: string = ''

  protected indent = 0
  protected value = ''

  protected entryType: EntryType = EntryType.TARGET

  public readonly entries: Entry[] = []

  constructor(protected readonly it: ICharacterIterator) {}

  async read() {
    let c: string | null
    while ((c = await this.it.next()) !== null) {
      this.processToken(c)
    }
    if (this.lastChar !== '\r' && this.lastChar !== '\n') {
      // in case the file does not end with a new line
      this.processToken('\n')
    }
  }

  protected fail(message: string) {
    throw new Error(
      `[${this.line}, ${this.position}]: [${this.value}] ${message}`)
  }

  protected newLine() {
    this.line += 1
    this.position = 0
  }

  protected addToValue(c: string) {
    this.value += c
  }

  protected processTargetName(c: string) {
    switch (c) {
      case ' ':
        if (this.value !== '') {
          this.fail('Target names cannot contain spaces')
        }
        this.indent += 1
        this.entryType = EntryType.COMMAND
        return
      case '\r':
      case '\n':
        if (this.value) {
          this.fail(
            'Newlines before target names are not allowed. ' +
            'Did you forget a colon?')
        }
        return
      case ':':
        if (!this.value.length) {
          this.fail('Cannot define a target without a name')
        }
        this.entries.push(new Entry(EntryType.TARGET, this.value))
        this.entryType = EntryType.DEPENDENCY
        this.value = ''
        return
      default:
        this.addToValue(c)
    }
  }

  protected processDependencyName(c: string) {
    switch(c) {
      case ':':
        this.fail('Dependency names cannot contain colons')
      case ' ':
        if (!this.value) {
          return
        }
        this.entries.push(new Entry(EntryType.DEPENDENCY, this.value))
        this.value = ''
        return
      case '\n':
      case '\r':
        if (this.value) {
          this.entries.push(new Entry(EntryType.DEPENDENCY, this.value))
        }
        this.entryType = EntryType.TARGET
        this.value = ''
        this.indent = 0
        return
      default:
        this.addToValue(c)
    }
  }

  protected processCommand(c: string) {
    switch(c) {
      case ' ':
        if (!this.value) {
          this.indent += 1
          return
        }
        this.addToValue(c)
        return
      case '\n':
      case '\r':
        if (!this.value) {
          this.indent = 0
          this.entryType = EntryType.TARGET
          return
        }
        if (this.indent !== 2) {
          this.fail('Commands must be indented with 2 spaces!')
        }
        this.entries.push(new Entry(EntryType.COMMAND, this.value))
        this.value = ''
        this.indent = 0
        this.entryType = EntryType.TARGET
        return
      default:
        this.addToValue(c)
    }
  }

  protected processToken(c: string) {
    this.position += 1

    switch(this.entryType) {
      case EntryType.TARGET:
        this.processTargetName(c)
        break
      case EntryType.DEPENDENCY:
        this.processDependencyName(c)
        break
      case EntryType.COMMAND:
        this.processCommand(c)
        break
    }

    switch(c) {
      case '\r':
        this.newLine()
        break
      case '\n':
        if (this.lastChar !== '\r') {
          // count the lines properly for windows CRLF encoding
          this.newLine()
        }
        this.position = 0
        break
    }

    this.lastChar = c
  }

  public getPosition() {
    return this.position
  }

  public getLine() {
    return this.line
  }

}
