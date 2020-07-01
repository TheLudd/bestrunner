import tryFn from '@bestrunner/utils/lib/try-fn'

function asyncSequence (fnList) {
  const head = fnList[0]
  const tail = fnList.slice(1)
  return tail.reduce((acc, item) => acc.then(() => tryFn(item)), tryFn(head))
}

export default class Suite {
  constructor () {
    this.afterEaches = []
    this.beforeEaches = []
    this.tests = []
  }

  addAfterEach (fn) {
    this.afterEaches.push(fn)
  }

  addBeforeEach (fn) {
    this.beforeEaches.push(fn)
  }

  addTest (description, test) {
    this.tests.push({ description, test })
  }

  generateTests () {
    return this.tests.map((t) => {
      const { test, ...rest } = t

      return {
        ...rest,
        test: () => asyncSequence([
          ...this.beforeEaches,
          test,
          ...this.afterEaches,
        ]),
      }
    })
  }
}
