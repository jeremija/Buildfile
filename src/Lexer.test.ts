import {EntryType} from './EntryType'
import {Lexer} from './Lexer'
import {StringIterator} from './StringIterator'
import {getError} from './TestUtils'

describe('Lexer', () => {

  async function read(str: string) {
    const lexer = new Lexer(new StringIterator(str))
    await lexer.read()
    return lexer
  }

  describe('read', () => {
    it('constructs entries', async () => {
      const source = `

  
env:

  a=3
  b=4

  c=5


test:
  command1 command2

  command2 && command3


`
      const lexer = await read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 'env'},
        {type: EntryType.COMMAND, value: 'a=3'},
        {type: EntryType.COMMAND, value: 'b=4'},
        {type: EntryType.COMMAND, value: 'c=5'},
        {type: EntryType.TARGET, value: 'test'},
        {type: EntryType.COMMAND, value: 'command1 command2'},
        {type: EntryType.COMMAND, value: 'command2 && command3'},
      ])
    })

    it('reads dependency', async () => {
      const source = `t1: t2
  echo t1

t2:
  echo t2`

      const lexer = await read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 't1'},
        {type: EntryType.DEPENDENCY, value: 't2'},
        {type: EntryType.COMMAND, value: 'echo t1'},
        {type: EntryType.TARGET, value: 't2'},
        {type: EntryType.COMMAND, value: 'echo t2'},
      ])
    })

    it('reads multiple dependencies', async () => {
      const source = `t1: t2 t3
t2:`

      const lexer = await read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 't1'},
        {type: EntryType.DEPENDENCY, value: 't2'},
        {type: EntryType.DEPENDENCY, value: 't3'},
        {type: EntryType.TARGET, value: 't2'},
      ])
    })

    it('reads multiple commands w/ dependencies', async () => {
      const source = `a: -p b c
b: d
  echo b
c:
  echo c
d:
  echo d`
      const lexer = await read(source)
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 'a'},
        {type: EntryType.DEPENDENCY, value: '-p'},
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

    it('reads CRLF, LF and CR', async () => {
      let lexer = await read('\n\n')
      expect(lexer.getPosition()).toEqual(0)
      expect(lexer.getLine()).toEqual(3)

      lexer = await read('\r\n')
      expect(lexer.getPosition()).toEqual(0)
      expect(lexer.getLine()).toEqual(2)

      lexer = await read('\r')
      expect(lexer.getPosition()).toEqual(0)
      expect(lexer.getLine()).toEqual(2)
    })

    it('fails when commands are wrongly indented', async () => {
      const error = await getError(read(`command:
 test`))
      expect(error.message).toMatch(/2 spaces/)
    })

    it('fails when dependency names contain colons', async () => {
      const error = await getError(read(`command: command2:`))
      expect(error.message).toMatch(/cannot contain colons/)
    })

    it('fails when targets contain spaces', async () => {
      const error = await getError(read(`com mand:`))
      expect(error.message).toMatch(/cannot contain spaces/)
    })

    it('fails when colon is forgotten', async () => {
      const error = await getError(read(`command\n`))
      expect(error.message).toMatch(/forget a colon/)
    })

    it('fails when no target name', async () => {
      const error = await getError(read(`:\n`))
      expect(error.message).toMatch(/without a name/)
    })
  })
})
