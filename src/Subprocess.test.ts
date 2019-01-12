import {StdioOptions} from './Subprocess'
import {Subprocess} from './Subprocess'
import {environment} from './TestUtils'
import {getError} from './TestUtils'

describe('Subprocess', () => {

  describe('constructor', () => {
    it('sets stdio to inherit when log true', () => {
      const p = new Subprocess('test', environment)
      expect(p.stdio).toEqual('pipe')
    })
    it('sets stdio to ignore when log false', () => {
      const p = new Subprocess('test', environment, StdioOptions.IGNORE)
      expect(p.stdio).toEqual('ignore')
    })
  })

  describe('run', () => {

    it('rejects on error', async () => {
      const error = await getError(
        new Subprocess('exit 1', environment, StdioOptions.IGNORE).run())
      expect(error.message).toMatch(/exited with code 1/)
    })

    it('logs errors', async () => {
      await getError(
        new Subprocess(
          'invalid-non-existing-command',
          environment, StdioOptions.PIPE,
        )
        .run(),
      )
    })

    it('resolves on successful invocation', async () => {
      await new Subprocess('echo ok', environment, StdioOptions.IGNORE).run()
    })

  })

})
