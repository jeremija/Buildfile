import {main} from './cli'
import {dirname, join} from 'path'

describe('main', () => {

  const testBuildFile = join(__dirname, '..', 'test-files', 'Buildfile.test')

  describe('-h/--help', () => {
    it('prints help', async () => {
      await main(['--help'])
    })
  })

  describe('execute', () => {
    it('executes', async () => {
      await main(['-f', testBuildFile, '--', 'a', 'b'])
    })
  })

  describe('execute in parallel', () => {
    it('executes in parallel', async () => {
      await main(['-f', testBuildFile, '--parallel', '--', 'a', 'b'])
    })
  })

  describe('chdir', () => {

    const cwd = process.cwd()
    afterEach(() => {
      process.chdir(cwd)
    })

    it('changes working directory', async () => {
      await main(['-C', dirname(testBuildFile), '-f', 'Buildfile.test'])
    })
  })

  describe('--version', () => {
    it('prints version and exits', async () => {
      await main(['-v'])
    })
  })

})
