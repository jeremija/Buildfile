import {Environment} from './Environment'
import {StringIterator} from './StringIterator'
import {VariableExpander} from './VariableExpander'

describe('VariableExpander', () => {

  let cf!: VariableExpander
  beforeEach(() => {
    cf = new VariableExpander(new Environment({
      one: 'numero uno',
      two: 'num2',
    }))
  })

  function expand(value: string) {
    const it = new StringIterator(value)
    return cf.expand(it)
  }

  describe('expandFrom', () => {
    it('should do nothing when no $, or when $ sign is escaped by \\', () => {
      expect(expand('test a b c')).toEqual('test a b c')
      expect(expand('\\$test')).toEqual('$test')
    })

    it('should replace a single variable', () => {
      expect(expand('$one')).toEqual('numero uno')
    })

    it('should replace two variables', () => {
      expect(expand('$one$two')).toEqual('numero unonum2')
      expect(expand('$one $two')).toEqual('numero uno num2')
    })

    it('should replace multiple variables', () => {
      expect(expand('a $one $two b')).toEqual('a numero uno num2 b')
      expect(expand('a$one $two b')).toEqual('anumero uno num2 b')
    })

    it('should work with curly brace definitions', () => {
      expect(expand('${one}')).toEqual('numero uno')
      expect(expand('${ one}')).toEqual('numero uno')
      expect(expand('${   one   }')).toEqual('numero uno')
    })

    it('should replace with default value when value not set', () => {
      expect(expand('${three:four}')).toEqual('four')
      expect(expand('${three:$two}')).toEqual('num2')
      expect(expand('${three:a$two}')).toEqual('anum2')
      expect(expand('${three:${two}}')).toEqual('num2')
      expect(expand('${three:a${two}b}')).toEqual('anum2b')
    })

    it('should replace with default values when value not set', () => {
      expect(expand('${three:$one$two}')).toEqual('numero unonum2')
      expect(expand('${three:$one$two }')).toEqual('numero unonum2')
      expect(expand('${three:${one}${two}}')).toEqual('numero unonum2')
    })

    it('should support multiple levels of nested variables', () => {
      expect(expand('${four:${three:${two}}}')).toEqual('num2')
      expect(expand('${four: ${three:${two}}}')).toEqual(' num2')
    })

    it('should support escape character "\\" for default value', () => {
      expect(expand('${four:\\$test}')).toEqual('$test')
      expect(expand('${\\$four:\\$test}')).toEqual('$test')
      expect(expand('${\\$four:\\$test}')).toEqual('$test')
    })

    it('should exit on newline', () => {
      expect(expand('${four:\\$test}\n')).toEqual('$test')
    })
  })

})
