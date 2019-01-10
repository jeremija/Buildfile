import assert from 'assert'
import {IProgram} from './IProgram'
import {ParallelRunner} from './ParallelRunner'
import {SerialRunner} from './SerialRunner'
import {Target} from './Target'

export class ProgramExecutor {

  protected async executeDependencies(program: IProgram, targets: Target[]) {
    for (let target of targets) {
      if (target.dependencies.length) {
        await this.execute(program, target.dependencies)
      }
    }
  }

  async execute(program: IProgram, targets: string[] = []) {
    if (!targets.length) {
      targets = [program.mainTarget]
    }

    const parallel = targets[0] === '-p'
    if (parallel) {
      targets = targets.slice(1)
    }

    const selectedTargets = targets.map(t => {
      assert.ok(
        program.targets.hasOwnProperty(t),
        `Unknown target: ${t}`,
      )
      return program.targets[t]
    })

    await this.executeDependencies(program, selectedTargets)

    const runner = parallel ? new ParallelRunner() : new SerialRunner()
    await runner.run(selectedTargets)
  }
}
