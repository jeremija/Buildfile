import {DebugLogger} from './DebugLogger'

describe('DebugLogger', () => {


  describe('enable and disable', () => {
    it('enables and disables a logger', () => {
      let logger = DebugLogger.getLogger('test')
      logger = DebugLogger.getLogger('test')
      expect(logger.isEnabled()).toBe(false)
      logger.enable()
      expect(logger.isEnabled()).toBe(true)
      logger.disable()
      expect(logger.isEnabled()).toBe(false)

      DebugLogger.enableAll()
      logger = DebugLogger.getLogger('test2')
      expect(logger.isEnabled()).toBe(true)
      DebugLogger.enableAll(false)
      expect(logger.isEnabled()).toBe(false)

      DebugLogger.enable('test')
      DebugLogger.disable('test')

      logger.log('test')
      logger.error('test')
    })
  })

})
