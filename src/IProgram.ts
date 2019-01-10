import {Target} from './Target'

export interface IProgram {
  mainTarget: string
  targets: {[key: string]: Target}
  targetNames: string[]
}
