import multipipe from 'multipipe'
import AsyncBufferTransform from 'async-buffer-transform'
import tryFn from './try-fn'

function asyncTransform (fn) {
  function transform (x) {
    return tryFn(() => fn(x))
  }
  return new AsyncBufferTransform({ windowSize: Infinity, transform })
}

export default function createRunner (conf) {
  const {
    postHooks = [],
    preHooks = [],
    runTest,
  } = conf
  const hooks = [ ...preHooks, runTest, ...postHooks ]
    .map(asyncTransform)
  return multipipe(hooks)
}
