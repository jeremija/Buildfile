import {out} from './config'
import {spawn} from 'child_process'

export enum StdioOptions {
  PIPE = 'pipe',
  INHERIT = 'inherit',
  IGNORE = 'ignore',
}

export class Subprocess {

  constructor(
    public readonly command: string,
    public readonly stdio: StdioOptions = StdioOptions.PIPE,
  ) {}

  async run() {
    return new Promise((resolve, reject) => {
      out.log('> %s', this.command)
      const subprocess = spawn(this.command, [], {
        shell: true,
        stdio: this.stdio,
      })

      if (this.stdio === StdioOptions.PIPE) {
        subprocess.stdout.on('data', data => out.log(data))
        subprocess.stderr.on('data', data => out.error(data))
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
