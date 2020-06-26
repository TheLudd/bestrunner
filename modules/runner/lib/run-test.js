import tryFn from './try-fn'

export default function runTest (spec) {
  const { test } = spec
  return tryFn(test.bind({}))
    .then(() => ({ ...spec, status: 'passed' }))
    .catch((error) => ({ ...spec, status: 'error', error }))
}
