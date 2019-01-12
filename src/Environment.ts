import {getPathWithNodeModules} from './getPathWithNodeModules'

export interface IEnvironmentVariables {
    [key: string]: string | undefined
}

export class Environment {
  public readonly variables: IEnvironmentVariables = {}

  constructor(env: IEnvironmentVariables = process.env) {
    this.variables = {
      ...env,
      PATH: getPathWithNodeModules(),
    }
  }

  set(key: string, value: string | undefined) {
    this.variables[key] = value
  }

  get(key: string, defaultValue: string): string
  get(key: string): string | undefined
  get(key: string, defaultValue?: string): string | undefined {
    const value = this.variables[key]
    if (value === undefined && defaultValue !== undefined) {
      return defaultValue
    }
    return value
  }
}
