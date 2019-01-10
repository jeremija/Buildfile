import assert from 'assert'

interface Argument {
  readonly name: string
  readonly alias: string
  readonly description: string
  readonly required?: boolean
  readonly type: 'flag' | 'string'
  readonly default?: boolean | string
}

export interface IFlags {
  [name: string]: string | boolean
}

export interface IArgumentParserResult {
  flags: IFlags
  positional: string[]
}

export class ArgumentParser {

  public readonly args: {[key: string]: Argument} = {}
  public readonly requiredArgs: Set<string> = new Set()
  public readonly defaultArgs: Set<string> = new Set()

  constructor(args: Argument[]) {
    for (let arg of args) {
      const argument = {...arg}
      this.args[argument.name] = this.args[argument.alias] = argument

      if (arg.default) {
        this.defaultArgs.add(arg.name)
      }
      else if (arg.required) {
        this.requiredArgs.add(arg.name)
      }
    }
  }

  markArgument(flags: IFlags, arg: Argument, value: string | boolean) {
    if (arg.required) {
      this.requiredArgs.delete(arg.name)
    }
    if (arg.default) {
      this.defaultArgs.delete(arg.name)
    }
    flags[arg.name] = flags[arg.alias] = value
  }

  parse(args: string[]): IArgumentParserResult {
    const flags: IFlags = {}

    const positional = []
    let lastArg: Argument | undefined
    let onlyPositionals = false

    for (let value of args) {
      if (onlyPositionals) {
        positional.push(value)
        continue
      }

      if (lastArg) {
        flags[lastArg.name] = flags[lastArg.alias] = value
        this.markArgument(flags, lastArg, value)
        lastArg = undefined
        continue
      }

      if (value === '--') {
        onlyPositionals = true
        continue
      }

      if (value.startsWith('--')) {
        value = value.substring(2)
      } else if (value.startsWith('-')) {
        if (value.length > 2) {
          value = value.substring(1)
          for (let flag of value.split('')) {
            let arg = this.args[flag]
            assert(
              !arg || arg.type !== 'flag', `The argument "${flag}" is invalid`)
            this.markArgument(flags, arg, true)
          }
          continue
        }
        value = value.substring(1)
      }

      if (this.args.hasOwnProperty(value)) {
        let arg = this.args[value]
        switch (arg.type) {
          case 'flag':
            this.markArgument(flags, arg, true)
            break
          case 'string':
            lastArg = arg
            break
        }
        continue
      }
      positional.push(value)
    }

    if (lastArg) {
      throw new Error(`The flag ${lastArg.name} requires a value!`)
    }

    this.defaultArgs.forEach(defaultArg => {
      const arg = this.args[defaultArg]
      flags[arg.name] = flags[arg.alias] = arg.default!
    })

    if (this.requiredArgs.size) {
      throw new Error('The following arguments are missing: ' +
        Array.from(this.requiredArgs).toString())
    }

    return { flags, positional }
  }

}
