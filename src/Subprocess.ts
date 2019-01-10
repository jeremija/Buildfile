import {spawn} from 'child_process'

export class Subprocess {
  constructor(
    public readonly command: string,
    public readonly log: boolean = true,
  ) {}

  async run () {
    return new Promise((resolve, reject) => {
      console.log('==>', this.command)
      const subprocess = spawn(this.command, [], {
        shell: true,
        stdio: "inherit",
      })

      subprocess.on('close', code => {
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`${this.command} exited with code ${code}`))
        }
      })
      subprocess.on('error', reject)
    })
  }
}

