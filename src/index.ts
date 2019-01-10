import assert from 'assert'
import * as fs from 'fs'
import * as path from 'path'
import {spawn} from 'child_process'

export class Target {
  public readonly commands: Command[] = []

  constructor(readonly name: string) {}

  addCommand(command: Command) {
    this.commands.push(command)
  }
}

export class Command {
  constructor(readonly value: string) {}
}

export enum Type {
  TARGET,
  COMMAND,
}

class Entry {
  constructor(
    readonly type: Type,
    readonly value: string,
  ) {}
}

export class Lexer {

  protected position = 0
  protected line = 1

  protected indent = 0
  protected value = ''

  public readonly entries: Entry[] = []

  constructor() {
  }

  async read(readable: NodeJS.ReadableStream) {
    return new Promise((resolve, reject) => {
      readable.setEncoding('utf8');
      readable.on('error', reject)
      readable.on('readable', () => {
        let chunk: string
        while ((chunk = readable.read(1) as string) !== null) {
          this.processToken(chunk)
        }
      })

      readable.on('end', () => {
        resolve()
      })
    })
  }

  protected fail(message: string) {
    throw new Error(`Lexer error: [${this.position}, ${this.line}]: ${message}
${this.value}`)
  }

  protected newLine() {
    this.line += 1
    this.position = 0
    this.value = ''
    this.indent = 0
  }

  protected processToken(c: string) {
    this.position += 1
    const value = this.value
    switch(c) {
      case '\r':
      case '\n':
        if (value === '') {
          this.newLine()
          return
        }
        if (this.indent === 0) {
          if (value.length > 1 && value.substring(value.length - 1) !== ':') {
            this.fail('Targets must end with a colon!')
            return
          }
          this.entries.push(
            new Entry(Type.TARGET, value.substring(0, value.length - 1)),
          )
          this.newLine()
          return
        }
        if (this.indent !== 2) {
          this.fail('Subcommands must be indented with 2 spaces!')
        }
        this.entries.push(new Entry(Type.COMMAND, value))
        this.newLine()
        return

      default:
        if (c === ' ') {
          if (value.length === 0) {
            this.indent += 1
            return
          }
          this.value += c
          return
        }
        this.value += c
        return
    }
  }

}

export class Parser {
  public readonly targets: {[key: string]: Target} = {}

  parse(entries: Entry[]) {
    let target: Target|undefined = undefined
    entries.forEach(entry => {
      switch(entry.type) {
        case (Type.TARGET):
          target = new Target(entry.value)
          this.registerTarget(target)
          break
        case (Type.COMMAND):
          let command = new Command(entry.value)
          if (!target) {
            throw new Error('A command must have a parent target:' + command)
          }
          target.addCommand(command)
          break
      }
    })
  }

  registerTarget(target: Target) {
    if (this.targets.hasOwnProperty(target.name)) {
      throw new Error('Target names must be unique: ' + target.name)
    }
    this.targets[target.name] = target
  }
}

export function findNodeModules(dir = process.cwd()): string | undefined {
  try {
    const candidate = path.join(dir, 'node_modules', '.bin')
    const result = fs.statSync(candidate)
    if (result.isDirectory()) {
      return candidate
    }
  } catch (err) {
    // pass
  }

  const dir2 = path.dirname(dir)
  if (dir2 === dir) {
    return
  }
  findNodeModules(dir2)
}

export class Subprocess {
  constructor(
    public readonly command: string,
    public readonly log: boolean = true,
  ) {}

  async run () {
    return new Promise((resolve, reject) => {
      console.log('==>', this.command)
      const subprocess = spawn(this.command, [], {
        shell: true
      })

      if (this.log) {
        subprocess.stdout.on('data', data =>
          process.stdout.write(data.toString()))
        subprocess.stderr.on('data', data =>
          process.stderr.write(data.toString()))
      }

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

export async function runInParallel(subprocesses: Subprocess[][]) {
  await Promise.all(
    subprocesses.map(spList =>
      Promise.all(spList.map(sp => sp.run()))))
}

export async function runInSeries(subprocesses: Subprocess[][]) {
  for (let spList of subprocesses) {
    for (let sp of spList) {
      await sp.run()
    }
  }
}

export async function main(args: string[]) {
  const isHelp = args[0] === '-h' || args[0] === '--help'
  if (isHelp) {
    console.log('Usage: build [-p] <target1> [<target2> <target3> ...]')
  }

  const file = path.join(process.cwd(), 'Buildfile')
  const readable = fs.createReadStream(file)
  const lexer = new Lexer()
  await lexer.read(readable)
  const parser = new Parser()
  parser.parse(lexer.entries)
  const targets = parser.targets

  if (isHelp) {
    console.log('Available targets: ' + Object.keys(targets).join(', '))
    return
  }

  const parallel = args[0] === '-p'
  if (parallel) {
    args.slice(1)
  }

  const specificTargets = args.map(target => {
    assert(targets.hasOwnProperty(target), 'Unknown target: ' + target)
    return targets[target].commands
    .map(command => new Subprocess(command.value))
  })
  // const subprocesses = args.map(arg => new Subprocess(arg))

  if (parallel) {
    await runInParallel(specificTargets)
  } else {
    await runInSeries(specificTargets)
  }
}

if (require.main === module) {
  main(process.argv.slice(2))
  .then(() => process.exit(0))
  .catch(err => {
    // console.error('!!! ', err.message)
    console.error('!!! ', err.stack)
    process.exit(1)
  })
}
