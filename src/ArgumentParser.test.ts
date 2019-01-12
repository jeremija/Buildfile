import {ArgumentParser, IArgument} from './ArgumentParser'

describe('ArgumentParser', () => {

  const flags: IArgument[] = [{
    name: 'p',
    alias: 'person',
    description: 'first name',
    type: 'string',
  }, {
    name: 'c',
    alias: 'config',
    description: 'config file',
    type: 'string',
    required: true,
  }, {
    name: 'f',
    alias: 'fetch',
    description: 'a flag',
    default: false,
  }]

  describe('successful testCases', () => {
    const defaultArgs = {f: false, fetch: false}

    const testCases = [{
      options: flags,
      args: ['-c', 'config.yml'],
      result: {c: 'config.yml', config: 'config.yml', ...defaultArgs},
      positional: [],
    }, {
      options: flags,
      args: ['--config=config.yml'],
      result: {c: 'config.yml', config: 'config.yml', ...defaultArgs},
      positional: [],
    }, {
      options: flags,
      args: ['--config', 'config.yml'],
      result: {c: 'config.yml', config: 'config.yml', ...defaultArgs},
      positional: [],
    }, {
      options: flags,
      args: ['-fc', 'config.yml'],
      result: {c: 'config.yml', config: 'config.yml', f: true, fetch: true},
      positional: [],
    }, {
      options: flags,
      args: ['-fc', 'config.yml', 'test'],
      result: {c: 'config.yml', config: 'config.yml', f: true, fetch: true},
      positional: ['test'],
    }, {
      options: flags,
      args: ['-fc', 'config.yml', '--', '--config', 'test'],
      result: {c: 'config.yml', config: 'config.yml', f: true, fetch: true},
      positional: ['--config', 'test'],
    }, {
      options: flags,
      args: ['-c', 'config.yml', '-f'],
      result: {c: 'config.yml', config: 'config.yml', f: true, fetch: true},
      positional: [],
    }, {
      options: [{
        name: 'p',
        alias: 'person',
        description: 'first name',
        type: 'string',
        default: 'john',
        required: true,
      }] as IArgument[],
      args: [],
      result: {p: 'john', person: 'john'},
      positional: [],
    }]

    for (const testCase of testCases) {
      it(`parses arguments: ${testCase.args.join(' ')}`, () => {
        const p = new ArgumentParser(testCase.options)
        const result = p.parse(testCase.args)
        expect(result.flags).toEqual(testCase.result)
        expect(result.positional).toEqual(testCase.positional)
      })
    }
  })

  describe('errors', () => {
    const testCases = [{
      options: flags,
      args: [],
      error: /missing: -c\/--config/,
    }, {
      options: flags,
      args: ['-cf'],
      error: /"-c" is at invalid location/,
    }]

    const p = new ArgumentParser(flags)
    for (const testCase of testCases) {
      it(`should result in error: ${testCase.error}`, () => {
        expect(() => p.parse(testCase.args))
        .toThrowError(testCase.error)
      })
    }
  })

  it('fails when argument does not receive a value', () => {
    const p = new ArgumentParser([{
      name: 'p',
      alias: 'person',
      description: 'description',
      type: 'string',
    }])
    expect(() => p.parse(['-p'])).toThrowError(/-p\/--person requires a value/)
  })

  it('sets variables', () => {
    const p = new ArgumentParser([])
    expect(p.parse(['a=1', 'b=2']).variables).toEqual({
      a: '1',
      b: '2',
    })
  })

  describe('help', () => {

    it('prints help', () => {
      const p = new ArgumentParser(flags)
      expect(p.help()).toEqual(`
Required arguments:
  -c, --config CONFIG   config file

Optional arguments:
  -p, --person PERSON   first name
  -f, --fetch           a flag (default: false)
`)
    })

  })

})
