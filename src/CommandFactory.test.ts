import {CommandFactory} from './CommandFactory'
import {EntryType} from './EntryType'
import {Entry} from './Entry'
import {Environment} from './Environment'
import {VariableExpander} from './VariableExpander'

describe('CommandFactory', () => {

  let cf!: CommandFactory
  beforeEach(() => {
    const expander = new VariableExpander(new Environment({
      one: 'numero uno',
      two: 'num2',
    }))
    cf = new CommandFactory(expander)
  })

  function create(value: string) {
    const entry = new Entry(EntryType.COMMAND, value)
    return cf.createFrom(entry)
  }

  describe('createFrom', () => {
    it('should do nothing when no $, or when $ sign is escaped by \\', () => {
      expect(create('test a b c').value).toEqual('test a b c')
      expect(create('\\$test').value).toEqual('$test')
    })

    it('should replace a single variable', () => {
      expect(create('$one').value).toEqual('numero uno')
    })

    it('should replace two variables', () => {
      expect(create('$one$two').value).toEqual('numero unonum2')
      expect(create('$one $two').value).toEqual('numero uno num2')
    })

    it('should replace multiple variables', () => {
      expect(create('a $one $two b').value).toEqual('a numero uno num2 b')
      expect(create('a$one $two b').value).toEqual('anumero uno num2 b')
    })

    it('should work with curly brace definitions', () => {
      expect(create('${one}').value).toEqual('numero uno')
      expect(create('${ one}').value).toEqual('numero uno')
      expect(create('${   one   }').value).toEqual('numero uno')
    })

    it('should replace with default value when value not set', () => {
      expect(create('${three:four}').value).toEqual('four')
      expect(create('${three:$two}').value).toEqual('num2')
      expect(create('${three:a$two}').value).toEqual('anum2')
      expect(create('${three:${two}}').value).toEqual('num2')
      expect(create('${three:a${two}b}').value).toEqual('anum2b')
    })

    it('should replace with default values when value not set', () => {
      expect(create('${three:$one$two}').value).toEqual('numero unonum2')
      expect(create('${three:${one}${two}}').value).toEqual('numero unonum2')
    })

    it('should support multiple levels of nested variables', () => {
      expect(create('${four:${three:${two}}}').value).toEqual('num2')
      expect(create('${four: ${three:${two}}}').value).toEqual(' num2')
    })

    it('should support escape character "\\" for default value', () => {
      expect(create('${four:\\$test}').value).toEqual('$test')
      expect(create('${\\$four:\\$test}').value).toEqual('$test')
      expect(create('${\\$four:\\$test}').value).toEqual('$test')
    })
  })

})
