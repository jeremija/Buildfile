import {Subprocess} from './Subprocess'
import {getError} from './TestUtils'

describe('Subprocess', () => {

  describe('constructor', () => {
    it('sets stdio to inherit when log true', () => {
      const p = new Subprocess('test', true)
      expect(p.stdio).toEqual('inherit')
    })
    it('sets stdio to ignore when log false', () => {
      const p = new Subprocess('test', false)
      expect(p.stdio).toEqual('ignore')
    })
  })

  describe('run', () => {

    it('rejects on error', async () => {
      const error = await getError(new Subprocess('exit 1', false).run())
      expect(error.message).toMatch(/exited with code 1/)
    })

    it('resolves on successful invocation', async () => {
      await new Subprocess('echo ok', false).run()
    })

  })

})
