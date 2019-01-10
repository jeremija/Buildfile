import {createReadStream} from 'fs'
import {EntryType} from './EntryType'
import {Lexer} from './Lexer'
import {join} from 'path'

describe('Lexer', () => {

  let lexer!: Lexer
  beforeEach(() => {
    lexer = new Lexer()
  })

  function getStream() {
    return createReadStream(join(__dirname, 'Buildfile'))
  }

  describe('read', () => {
    it('constructs entries', async () => {
      await lexer.read(getStream())
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
  })
})
