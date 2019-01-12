import assert from 'assert'
import {Command} from './Command'
import {Environment} from './Environment'
import {Entry} from './Entry'
import {StringIterator} from './StringIterator'

interface IContext {
  it: StringIterator
  value: string
  char: string | null
  lastChar: string
}

interface IVariable {
  colon: boolean
  curlyBraceOpen: boolean
  defaultValue: string
  name: string
  value: string
  parent?: IVariable
}

export class CommandFactory {
  constructor(protected readonly environment: Environment) {}

  createFrom(entry: Entry): Command {
    const ctx: IContext = {
      it: new StringIterator(entry.value),
      value: '',
      char: null,
      lastChar: '',
    }

    while ((ctx.char = ctx.it.next()) !== null) {
      const c = ctx.char
      switch (ctx.char) {
        case '\\':
          break
        case '$':
          if (ctx.lastChar === '\\') {
            ctx.value += c
            break
          }
          const variable = this.readVariable(ctx)
          ctx.value += variable.value
          break
        default:
          ctx.value += c
      }
      ctx.lastChar = c
    }

    return new Command(ctx.value)
  }

  protected createVariable(parent?: IVariable): IVariable {
    return {
      colon: false,
      curlyBraceOpen: false,
      defaultValue: '',
      name: '',
      value: '',
      parent,
    }
  }

  protected readVariable(ctx: IContext): IVariable {
    let variable: IVariable | undefined = this.createVariable()
    const root: IVariable = variable

    const finish = (v: IVariable) => {
      assert.ok(v && v.name)
      v.value = this.environment.get(v.name, v.defaultValue)
      if (v.parent) {
        v.parent.defaultValue += v.value
      }
    }

    while (variable) {
      ctx.lastChar = ctx.char!
      ctx.char = ctx.it.next()

      switch (ctx.char) {
        case null:
        case ' ':
          if (variable.curlyBraceOpen) {
            if (variable.colon) {
              variable.defaultValue += ctx.char
            }
            break
          }
          finish(variable)
          variable = variable.parent
          break
        case '{':
          assert.ok(ctx.lastChar === '$')
          variable.curlyBraceOpen = true
          break
        case '}':
          if (variable.curlyBraceOpen) {
            variable.curlyBraceOpen = false
            finish(variable)
            variable = variable.parent
            break
          }
          // this is a close curly brace of the parent variable
          assert.ok(!variable.curlyBraceOpen)
          assert.ok(variable.parent && variable.parent.curlyBraceOpen)
          finish(variable)
          finish(variable.parent!)
          variable = variable.parent!.parent
          break
        case ':':
          assert.ok(variable.name)
          variable.colon = true
          break
        case '\\':
          break
        case '$':
          if (ctx.lastChar === '\\') {
            if (variable.colon) {
              variable.defaultValue += ctx.char
            } else {
              variable.name += ctx.char
            }
            break
          }

          assert.ok(variable.name)
          if (variable.curlyBraceOpen && variable.colon) {
            variable = this.createVariable(variable)
            break
          }

          assert.ok(variable.parent)
          finish(variable)
          variable = this.createVariable(variable.parent)
          break
        default:
          if (variable.colon) {
            assert.ok(variable.name)
            assert.ok(variable.curlyBraceOpen)
            variable.defaultValue += ctx.char
            break
          }
          variable.name += ctx.char
          const peek = ctx.it.peek()
          if (!variable.parent && !variable.curlyBraceOpen &&
            (peek === ' ' || peek === '$')
          ) {
            finish(variable)
            variable = undefined
          }
          break
      }

    }

    return root
  }

}
