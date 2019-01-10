import {EntryType} from './EntryType'
import {Lexer} from './Lexer'
import {StringIterator} from './StringIterator'

describe('Lexer', () => {


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
      const lexer = new Lexer(new StringIterator(source))
      await lexer.read()
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

    it('reads dependencies', async () => {
      const source = `t1: t2
  echo t1

t2:
  echo t2`

      const lexer = new Lexer(new StringIterator(source))
      await lexer.read()
      expect(lexer.entries).toEqual([
        {type: EntryType.TARGET, value: 't1'},
        {type: EntryType.DEPENDENCY, value: 't2'},
        {type: EntryType.COMMAND, value: 'echo t1'},
        {type: EntryType.TARGET, value: 't2'},
        {type: EntryType.COMMAND, value: 'echo t2'},
      ])
    })
  })
})
