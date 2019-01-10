import {ArgumentParser} from './ArgumentParser'

describe('ArgumentParser', () => {


  it('parses arguments', () => {
    const p = new ArgumentParser([{
      name: 'p',
      alias: 'person',
      description: 'description',
      type: 'string',
      required: true,
    }])

    const result = p.parse(['-p', 'joe'])
    expect(result.flags.person).toEqual('joe')
    expect(result.flags.p).toEqual('joe')
  })

})
