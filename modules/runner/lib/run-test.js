function tryFn (fn) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn())
    } catch (e) {
      reject(e)
    }
  })
}

export default function runTest (spec) {
  const { test } = spec
  return tryFn(test.bind({}))
    .then(() => ({ ...spec, status: 'passed' }))
    .catch((error) => ({ ...spec, status: 'error', error }))
}
