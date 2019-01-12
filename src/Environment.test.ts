import {Environment} from './Environment'
import {getPathWithNodeModules} from './getPathWithNodeModules'

describe('Environment', () => {

  describe('constructor', () => {
    it('sets default variables to process.env and modified PATH', () => {
      const e = new Environment()
      expect(e.variables).toEqual({
        ...process.env,
        PATH: getPathWithNodeModules(),
      })
    })

    it('does not modify path', () => {
      const PATH = process.env.PATH
      const e = new Environment()
      expect(e.variables).toEqual({
        ...process.env,
        PATH: getPathWithNodeModules(),
      })
      expect(process.env.PATH).toEqual(PATH)
    })

    it('can be initialized with custom set of variables', () => {
      const v = {a: '1'}
      const e = new Environment(v)
      expect(e.variables).toEqual({
        ...v,
        PATH: getPathWithNodeModules(),
      })
    })

  })

  describe('set and get', () => {
    it('can be used to set custom variables', () => {
      const v = {a: '1'}
      const e = new Environment(v)
      e.set('a', 'b')
      expect(e.get('a')).toEqual('b')

      e.set('a', undefined)
      expect(e.get('a')).toEqual(undefined)
      expect(e.get('a', 'b')).toEqual('b')
      expect(e.get('a', '')).toEqual('')
    })
  })

})
