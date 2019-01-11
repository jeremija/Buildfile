import {Subprocess} from './Subprocess'
import {StdioOptions} from './Subprocess'
import {getError} from './TestUtils'

describe('Subprocess', () => {

  describe('constructor', () => {
    it('sets stdio to inherit when log true', () => {
      const p = new Subprocess('test')
      expect(p.stdio).toEqual('pipe')
    })
    it('sets stdio to ignore when log false', () => {
      const p = new Subprocess('test', StdioOptions.IGNORE)
      expect(p.stdio).toEqual('ignore')
    })
  })

  describe('run', () => {

    it('rejects on error', async () => {
      const error = await getError(
        new Subprocess('exit 1', StdioOptions.IGNORE).run())
      expect(error.message).toMatch(/exited with code 1/)
    })

    it('logs errors', async () => {
      await getError(
        new Subprocess('invalid-non-existing-command', StdioOptions.PIPE)
        .run(),
      )
    })

    it('resolves on successful invocation', async () => {
      await new Subprocess('echo ok', StdioOptions.IGNORE).run()
    })

  })

})
