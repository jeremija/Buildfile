import {spawn} from 'child_process'
import {ConsoleLogger} from './ConsoleLogger'

export enum StdioOptions {
  PIPE = 'pipe',
  INHERIT = 'inherit',
  IGNORE = 'ignore'
}

const logger = new ConsoleLogger()

export class Subprocess {

  constructor(
    public readonly command: string,
    public readonly stdio: StdioOptions = StdioOptions.PIPE,
  ) {}

  async run () {
    return new Promise((resolve, reject) => {
      console.log('==>', this.command)
      const subprocess = spawn(this.command, [], {
        shell: true,
        stdio: this.stdio
      })

      if (this.stdio === StdioOptions.PIPE) {
        subprocess.stdout.on('data', data => logger.log(data))
        subprocess.stderr.on('data', data => logger.error(data))
      }

      subprocess.on('close', code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`"${this.command}" exited with code ${code}`))
        }
      })
      subprocess.on('error', reject)
    })
  }
}

