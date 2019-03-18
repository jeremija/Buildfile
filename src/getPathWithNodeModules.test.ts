import {join, normalize} from 'path'
import {mkdirSync, writeFileSync} from 'fs'
import {platform} from 'os'
import {
  findNodeModulesBin,
  getPathSeparator,
  addPathVariable,
} from './getPathWithNodeModules'

describe('findNodeModulesBin', () => {

  beforeAll(() => {
    // node_modules get removed after "npm ci" is run, so this one needs to be
    // recreated, since it is only used for testing.
    const testPath = getPath('..', 'test-files', 'node_modules')
    try {
      mkdirSync(testPath)
    } catch (err) {
      // ok if dir already exists
    }
    writeFileSync(join(testPath, '.bin'), '')
  })

  const getPath = (...p: string[]) => normalize(join(__dirname, ...p))

  it('returns the closest node_modules/.bin folder to cwd', () => {
    let value = findNodeModulesBin(process.cwd())
    expect(value).toEqual(getPath('..', 'node_modules', '.bin'))

    value = findNodeModulesBin(join(process.cwd(), 'test', 'bla'))
    expect(value).toEqual(getPath('..', 'node_modules', '.bin'))

    value = findNodeModulesBin(join('/non-existing/dir/bla/123/test'))
    expect(value).toEqual('')

    value = findNodeModulesBin(getPath('..', 'test-files', 'bla'))
    expect(value).toEqual(getPath('..', 'node_modules', '.bin'))
  })

})

describe('getPathSeparator', () => {

  it('returns ";" when win32 and ":" for other systems', () => {
    expect(getPathSeparator('win32')).toEqual(';')
    expect(getPathSeparator('linux')).toEqual(':')
    expect(getPathSeparator('darwin')).toEqual(':')
  })

})

describe('addPathVariable', () => {

  it('does nothing when pathToAdd is undefined', () => {
    const path = process.env.PATH!
    expect(addPathVariable(path, undefined)).toEqual(path)
  })
  it('adds a to path', () => {
    const path = process.env.PATH!
    const separator = getPathSeparator(platform())
    expect(addPathVariable(path, '/test')).toEqual(`/test${separator}${path}`)
  })

})
