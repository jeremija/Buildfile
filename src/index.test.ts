import {bootstrap, Bootstrap} from './index'

describe('index', () => {
  describe('bootstrap', () => {
    it('should be an instance of Bootstrap', () => {
      expect(bootstrap instanceof Bootstrap).toBe(true)
    })
  })
})
