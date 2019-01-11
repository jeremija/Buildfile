import {Wildcard} from './Wildcard'

describe('Wildcard', () => {

  const strings = [
    'build',
    'build:js',
    'build:css',
    'js:build',
    'css:build',
    'js:watch:build',
    'css:watch:build',
  ]

  describe('match', () => {

    it('filters lists', () => {
      expect(new Wildcard('*').match(strings)).toEqual(strings)
      expect(new Wildcard('build*').match(strings)).toEqual([
        'build',
        'build:js',
        'build:css'
      ])
      expect(new Wildcard('build*').match(strings)).toEqual([
        'build',
        'build:js',
        'build:css'
      ])
      expect(new Wildcard('*:watch:*').match(strings)).toEqual([
        'js:watch:build',
        'css:watch:build',
      ])
    })

    it('throws an error when not found', () => {
      expect(() => new Wildcard('notfound').match(strings))
      .toThrowError(/no match/i)
    })

  })

})
