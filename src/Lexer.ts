import {DebugLogger} from './DebugLogger'
import {EntryType} from './EntryType'
import {Entry} from './Entry'
import {ICharacterIterator} from './ICharacterIterator'

const logger = new DebugLogger('lexer')

export class Lexer {

  protected position = 0
  protected line = 1
  protected lastChar: string = ''
  protected lastChar2: string = ''

  protected indent = 0
  protected value = ''

  protected entryType: EntryType = EntryType.TARGET

  public readonly entries: Entry[] = []
  public readonly targets: string[] = []

  constructor(protected readonly it: ICharacterIterator) {}

  read() {
    let c: string | null
    while ((c = this.it.next()) !== null) {
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

  protected addEntry(entryType: EntryType) {
    logger.log('addEntry: [%d %d] %s %s',
      this.line, this.position, entryType, this.value)
    this.entries.push(new Entry(entryType, this.value))
  }

  protected processVariableEquals(c: string) {
    if (c !== '=') {
      this.fail('Expected equals ("=") sign after variable definition')
    }
    if (this.it.next() !== ' ') {
      this.fail('Expected space (" ") after equal sign')
    }
    this.value += '= '
    this.addEntry(this.entryType)
    this.entryType = EntryType.VARIABLE_VALUE
    this.value = ''
  }

  protected processVariableValue(c: string) {
    switch (c) {
      case '\n':
      case '\r':
        this.addEntry(EntryType.VARIABLE_VALUE)
        this.entryType = EntryType.TARGET
        this.value = ''
        this.indent = 0
        return
      default:
        this.value += c
    }
  }

  protected processTargetName(c: string) {
    switch (c) {
      case ' ':
        if (this.value) {
          const peek = this.it.peek()
          if (peek === ':') {
            this.addEntry(EntryType.VARIABLE_NAME)
            this.entryType = EntryType.VARIABLE_EQUALS
            this.value = ' :'
            this.it.next()
            return
          } else if (peek === '?') {
            this.addEntry(EntryType.VARIABLE_NAME)
            this.entryType = EntryType.VARIABLE_IFNOT
            this.value = ' ?'
            this.it.next()
            return
          }
        }
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
        this.addEntry(EntryType.TARGET)
        this.targets.push(this.value)
        this.entryType = EntryType.DEPENDENCY
        this.value = ''
        return
      default:
        this.addToValue(c)
    }
  }

  protected processDependencyName(c: string) {
    switch (c) {
      case ':':
        this.fail('Dependency names cannot contain colons')
      case ' ':
        if (!this.value) {
          return
        }
        if (this.value === '-p' || this.value === '--parallel') {
          this.addEntry(EntryType.PARALLEL_FLAG)
          this.value = ''
          return
        }
        this.addEntry(EntryType.DEPENDENCY)
        this.value = ''
        return
      case '\n':
      case '\r':
        if (this.value) {
          this.addEntry(EntryType.DEPENDENCY)
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
    switch (c) {
      case ' ':
        if (!this.value) {
          this.indent += 1
          return
        }
        this.addToValue(c)
        return
      case '\\':
        this.addToValue(c)
        return
      case '\n':
      case '\r':
        if (this.lastChar === '\\' ||
            this.lastChar === '\r' && c === '\n' && this.lastChar2 === '\\') {
          // handle line continuations
          this.addToValue(c)
          return
        }
        if (!this.value) {
          this.indent = 0
          this.entryType = EntryType.TARGET
          return
        }
        if (this.indent !== 2) {
          this.fail('Commands must be indented with 2 spaces!')
        }
        this.addEntry(EntryType.COMMAND)
        this.value = ''
        this.indent = 0
        this.entryType = EntryType.TARGET
        return
      default:
        this.addToValue(c)
    }
  }

  protected processComment(c: string) {
    switch (c) {
      case '\n':
      case '\r':
        this.addEntry(EntryType.COMMENT)
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

    if (c === '#' && this.value === '') {
      this.entryType = EntryType.COMMENT
    }

    switch (this.entryType) {
      case EntryType.COMMENT:
        this.processComment(c)
        break
      case EntryType.TARGET:
        this.processTargetName(c)
        break
      case EntryType.DEPENDENCY:
        this.processDependencyName(c)
        break
      case EntryType.COMMAND:
        this.processCommand(c)
        break
      case EntryType.VARIABLE_EQUALS:
      case EntryType.VARIABLE_IFNOT:
        this.processVariableEquals(c)
        break
      case EntryType.VARIABLE_VALUE:
        this.processVariableValue(c)
        break
    }

    switch (c) {
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

    this.lastChar2 = this.lastChar
    this.lastChar = c
  }

  public getPosition() {
    return this.position
  }

  public getLine() {
    return this.line
  }

}
