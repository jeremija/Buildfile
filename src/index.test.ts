import {createReadStream} from 'fs'
import {Type, Lexer} from './index'
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
        {type: Type.TARGET, value: 'env'},
        {type: Type.COMMAND, value: 'a=3'},
        {type: Type.COMMAND, value: 'b=4'},
        {type: Type.COMMAND, value: 'c=5'},
        {type: Type.TARGET, value: 'test'},
        {type: Type.COMMAND, value: 'command1 command2'},
        {type: Type.COMMAND, value: 'command2 && command3'},
      ])
    })
  })
})
