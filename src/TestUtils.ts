export async function getError(promise: Promise<any>): Promise<Error> {
  let error: Error | undefined
  try {
    await promise
  } catch (err) {
    error = err
  }
  expect(error).toBeTruthy()
  return error!
}
