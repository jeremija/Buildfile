import {NoopLogger} from './NoopLogger'

describe('NoopLogger', () => {

  it('does nothing', () => {
    const l = new NoopLogger()
    l.log('test log')
    l.error('test error')
  })
})
