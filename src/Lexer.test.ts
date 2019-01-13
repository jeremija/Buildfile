import {EntryType} from './EntryType'
import {Lexer} from './Lexer'
import {StringIterator} from './StringIterator'

describe('Lexer', () => {

  function read(str: string) {
    const lexer = new Lexer(new StringIterator(str))
    lexer.read()
    return lexer
  }

  describe('read', () => {
    it('constructs entries', () => {
      // tslint:disable
      const source = `
var1 := num1
var2 ?= num2

# comment1
env:

  a=3
  b=4 \\
  d=5
  e=6 \\\r
  f=7
  # comment2

  c=5
  


test:
  command1 command2

  command2 && command3


`
      // tslint:enable
      const lexer = read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.VARIABLE_NAME, value: 'var1'},
        {type: EntryType.VARIABLE_EQUALS, value: ' := '},
        {type: EntryType.VARIABLE_VALUE, value: 'num1'},
        {type: EntryType.VARIABLE_NAME, value: 'var2'},
        {type: EntryType.VARIABLE_IFNOT, value: ' ?= '},
        {type: EntryType.VARIABLE_VALUE, value: 'num2'},
        {type: EntryType.COMMENT, value: '# comment1'},
        {type: EntryType.TARGET, value: 'env'},
        {type: EntryType.COMMAND, value: 'a=3'},
        {type: EntryType.COMMAND, value: 'b=4 \\\n  d=5'},
        {type: EntryType.COMMAND, value: 'e=6 \\\r\n  f=7'},
        {type: EntryType.COMMENT, value: '# comment2'},
        {type: EntryType.COMMAND, value: 'c=5'},
        {type: EntryType.TARGET, value: 'test'},
        {type: EntryType.COMMAND, value: 'command1 command2'},
        {type: EntryType.COMMAND, value: 'command2 && command3'},
      ])
    })

    it('reads dependency', () => {
      const source = `t1: t2
  echo t1

t2:
  echo t2`

      const lexer = read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 't1'},
        {type: EntryType.DEPENDENCY, value: 't2'},
        {type: EntryType.COMMAND, value: 'echo t1'},
        {type: EntryType.TARGET, value: 't2'},
        {type: EntryType.COMMAND, value: 'echo t2'},
      ])
    })

    it('reads multiple dependencies', () => {
      const source = `t1: t2 t3
t2:`

      const lexer = read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 't1'},
        {type: EntryType.DEPENDENCY, value: 't2'},
        {type: EntryType.DEPENDENCY, value: 't3'},
        {type: EntryType.TARGET, value: 't2'},
      ])
    })

    it('reads multiple commands w/ dependencies', () => {
      const source = `a: -p b c
b: d
  echo b
c:
  echo c
d:
  echo d`
      const lexer = read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 'a'},
        {type: EntryType.PARALLEL_FLAG, value: '-p'},
        {type: EntryType.DEPENDENCY, value: 'b'},
        {type: EntryType.DEPENDENCY, value: 'c'},
        {type: EntryType.TARGET, value: 'b'},
        {type: EntryType.DEPENDENCY, value: 'd'},
        {type: EntryType.COMMAND, value: 'echo b'},
        {type: EntryType.TARGET, value: 'c'},
        {type: EntryType.COMMAND, value: 'echo c'},
        {type: EntryType.TARGET, value: 'd'},
        {type: EntryType.COMMAND, value: 'echo d'},
      ])
    })

    it('reads CRLF, LF and CR', () => {
      let lexer = read('\n\n')
      expect(lexer.getPosition()).toEqual(0)
      expect(lexer.getLine()).toEqual(3)

      lexer = read('\r\n')
      expect(lexer.getPosition()).toEqual(0)
      expect(lexer.getLine()).toEqual(2)

      lexer = read('\r')
      expect(lexer.getPosition()).toEqual(0)
      expect(lexer.getLine()).toEqual(2)
    })

    it('fails when commands are wrongly indented', () => {
      expect(() => read(`command:
 test`))
      .toThrowError(/2 spaces/)
    })

    it('fails when dependency names contain colons', () => {
      expect(() => read(`command: command2:`))
      .toThrowError(/cannot contain colons/)
    })

    it('fails when targets contain spaces', () => {
      expect(() => read(`com mand:`))
      .toThrowError(/cannot contain spaces/)
    })

    it('fails when colon is forgotten', () => {
      expect(() => read(`command\n`))
      .toThrowError(/forget a colon/)
    })

    it('fails when no target name', () => {
      expect(() => read(`:\n`))
      .toThrowError(/without a name/)
    })

    it('fails when no expected equals sign', () => {
      expect(() => read(`var :t`))
      .toThrowError(/expected equals/i)

      expect(() => read(`var ?t`))
      .toThrowError(/expected equals/i)
    })

    it('fails when no expected space after equals sign', () => {
      expect(() => read(`var :=t`))
      .toThrowError(/expected space/i)

      expect(() => read(`var ?=t`))
      .toThrowError(/expected space/i)
    })
  })
})
