type Value = boolean | string

export interface IArgument {
  readonly name: string
  readonly alias: string
  readonly description: string
  readonly required?: boolean
  readonly type?: 'flag' | 'string'
  readonly default?: Value
}

export interface IFlags {
  [name: string]: Value
}

interface IArgumentMap {
  [key: string]: IArgument
}

export interface IResult {
  flags: IFlags
  positional: string[]
}

export interface IContext extends IResult{
  requiredArgs: IArgumentMap,
  defaultArgs: IArgumentMap,
  onlyPositionals: boolean,
  pending: IArgument | undefined,
}

export class ArgumentParser {

  public readonly args: IArgumentMap = {}

  constructor(protected readonly options: IArgument[]) {
    for (let arg of options) {
      const argument = {...arg}
      if (!argument.type) {
        argument.type = 'flag'
      }
      if (argument.default !== undefined) {
        switch(argument.type) {
          case 'string':
            argument.default = ''
            break
          case 'flag':
            argument.default = false
            break
        }
      }
      this.args[argument.name] = this.args[argument.alias] = argument
    }
  }

  protected add(ctx: IContext, arg: IArgument, value: Value) {
    if (arg.required) {
      delete ctx.requiredArgs[arg.name]
    }
    if (arg.default !== undefined) {
      delete ctx.defaultArgs[arg.name]
    }
    ctx.flags[arg.name] = ctx.flags[arg.alias] = value
  }

  /**
   * Parses arguments with a single dash and two or more letters
   */
  protected addFlags(ctx: IContext, value: string) {
    const chars = value.split('')
    chars.forEach((flag, index) => {
      let arg = this.args[flag]
      if (arg.type === 'string') {
        if (index < chars.length - 1) {
          throw new Error(
            `The argument "-${flag}" is at invalid location in "-${value}" because it requires a value`)
        }
        this.addValue(ctx, flag)
        return
      }
      this.add(ctx, arg, true)
    })
  }

  protected createContext(): IContext{
    const requiredArgs: IArgumentMap = {}
    const defaultArgs: IArgumentMap = {}
    for (let arg of this.options) {
      if (arg.default !== undefined) {
        defaultArgs[arg.name] = arg
      } else if (arg.required) {
        requiredArgs[arg.name] = arg
      }
    }

    return {
      flags: {},
      positional: [],
      requiredArgs,
      defaultArgs,
      onlyPositionals: false,
      pending: undefined,
    }
  }

  protected addValue(ctx: IContext, value: string) {
    const hasEquals = value.indexOf('=') >= 0
    let rightOfEquals = ''

    if (hasEquals) {
      [value, rightOfEquals] = value.split(/=(.+)/)
    }

    if (!this.args.hasOwnProperty(value)) {
      return false
    }

    const arg = this.args[value]
    switch (arg.type) {
      case 'flag':
        this.add(ctx, arg, true)
        break
      case 'string':
        if (hasEquals) {
          this.add(ctx, arg, rightOfEquals)
        } else {
          ctx.pending = arg
        }
        break
    }

    return true
  }

  help(): string {
    function getHelp(arg: IArgument) {
      let text = `  -${arg.name}, --${arg.alias}`
      if (arg.type === 'string') {
        text += ` ${arg.alias.toUpperCase() }`
      }
      for (let i = text.length; i < 24; i++) {
        text += ' '
      }
      text += arg.description
      if (arg.default !== undefined) {
        text += ` (default: ${arg.default})`
      }
      return text + '\n'
    }

    let help = '\nRequired arguments:\n'
    this.options.filter(arg => arg.required).forEach(arg => {
      help += getHelp(arg)
    })
    help += '\nOptional arguments:\n'
    this.options.filter(arg => !arg.required).forEach(arg => {
      help += getHelp(arg)
    })

    return help
  }

  parse(args: string[]): IResult {
    const ctx = this.createContext()

    for (let value of args) {
      const origValue = value
      if (ctx.onlyPositionals) {
        ctx.positional.push(value)
        continue
      }

      if (ctx.pending) {
        this.add(ctx, ctx.pending, value)
        ctx.pending = undefined
        continue
      }

      if (value === '--') {
        ctx.onlyPositionals = true
        continue
      }

      if (value.startsWith('--')) {
        value = value.substring(2)
      } else if (value.startsWith('-')) {
        value = value.substring(1)
        if (value.length > 1) {
          this.addFlags(ctx, value)
          continue
        }
      }

      if (this.addValue(ctx, value)) {
        continue
      }

      ctx.positional.push(origValue)
    }

    if (ctx.pending) {
      throw new Error(
        `Flag -${ctx.pending.name}/--${ctx.pending.alias} requires a value!`)
    }

    Object.keys(ctx.defaultArgs).forEach(key => {
      const arg = ctx.defaultArgs[key]
      this.add(ctx, arg, arg.default!)
    })

    const requiredArgs = Object.keys(ctx.requiredArgs)
    if (requiredArgs.length) {
      throw new Error('The following arguments are missing: ' +
        requiredArgs
        .map(arg => ctx.requiredArgs[arg])
        .map(arg => `-${arg.name}/--${arg.alias}`)
        .join(', ')
      )
    }

    return ctx
  }

}
