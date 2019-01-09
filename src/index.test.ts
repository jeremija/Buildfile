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
        {element: Type.TARGET, value: 'env'},
        {element: Type.COMMAND, value: 'a=3'},
        {element: Type.COMMAND, value: 'b=4'},
        {element: Type.COMMAND, value: 'c=5'},
        {element: Type.TARGET, value: 'test'},
        {element: Type.COMMAND, value: 'command1 command2'},
        {element: Type.COMMAND, value: 'command2 && command3'},
      ])
    })
  })
})
