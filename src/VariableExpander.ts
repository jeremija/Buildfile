import assert from 'assert'
import {Environment} from './Environment'
import {ICharacterIterator} from './ICharacterIterator'

interface IContext {
  it: ICharacterIterator
  value: string
  char: string | null
  lastChar: string,
}

interface IVariable {
  colon: boolean
  bracketOpen: boolean
  defaultValue: string
  name: string
  value: string
  parent?: IVariable
}

const STOP_CHARS = new Set([null, '\n'])

export class VariableExpander {
  constructor(
    protected readonly environment: Environment,
    readonly bracketOpen = '{',
    readonly bracketClose = '}',
  ) {}

  expand(it: ICharacterIterator) {
    const ctx: IContext = {
      it,
      value: '',
      char: null,
      lastChar: '',
    }

    while (!STOP_CHARS.has(ctx.char = ctx.it.next())) {
      const c = ctx.char!
      switch (c) {
        case '$':
          if (ctx.it.peek() === '$') {
            ctx.it.next()
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

    return ctx.value
  }

  protected createVariable(parent?: IVariable): IVariable {
    return {
      colon: false,
      bracketOpen: false,
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
      assert.ok(!v.bracketOpen)
      v.value = this.environment.get(v.name, v.defaultValue)
      if (v.parent) {
        v.parent.defaultValue += v.value
      }
    }

    while (variable) {
      ctx.lastChar = ctx.char!
      ctx.char = ctx.it.next()

      switch (ctx.char) {
        case ' ':
          if (variable.bracketOpen) {
            if (variable.colon && ctx.char !== null) {
              // handle space in ${var1: $var2}
              variable.defaultValue += ctx.char
            }
            // handle ${  variable  }
            break
          }
          // deliberate no break here
        case null:
        case '\n':
          finish(variable)
          variable = variable.parent
          break
        case this.bracketOpen:
          assert.ok(ctx.lastChar === '$')
          variable.bracketOpen = true
          break
        case this.bracketClose:
          if (variable.bracketOpen) {
            variable.bracketOpen = false
            finish(variable)
            variable = variable.parent
            break
          }
          // this is a close curly brace of the parent variable
          // assert.ok(!variable.bracketOpen)
          assert.ok(variable.parent && variable.parent.bracketOpen)
          variable.parent!.bracketOpen = false
          finish(variable)
          finish(variable.parent!)
          variable = variable.parent!.parent
          break
        case ':':
          assert.ok(variable.name)
          variable.colon = true
          break
        case '$':
          if (ctx.it.peek() === '$') {
            // handle $$variable
            ctx.it.next()
            if (variable.colon) {
              variable.defaultValue += ctx.char
            } else {
              variable.name += ctx.char
            }
            break
          }

          assert.ok(variable.name)
          if (variable.bracketOpen && variable.colon) {
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
            assert.ok(variable.bracketOpen)
            variable.defaultValue += ctx.char
            break
          }
          variable.name += ctx.char
          const peek = ctx.it.peek()
          if (!variable.parent && !variable.bracketOpen &&
            (peek === ' ' || peek === '$')
          ) {
            // support "$var1 $var2" and $var1$var2
            finish(variable)
            variable = undefined
            break
          }
          break
      }

    }

    return root
  }

}
