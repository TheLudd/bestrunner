import { assert } from 'chai'
import { pluck } from 'ramda'
import Suite from '../lib/suite'

const { equal, deepEqual } = assert

function waitThen (fn) {
  return () => Promise.resolve()
    .then(() => {
      fn()
    })
}

function executeInSequence (testList) {
  return testList.reduce((acc, item) => acc.then(() => item.test()), Promise.resolve())
}

describe('suite', () => {
  let suite
  beforeEach(() => {
    suite = new Suite()
  })

  it('can add single tests', () => {
    let executed = false
    suite.addTest('test1', () => {
      executed = true
    })
    const tests = suite.generateTests()
    const descriptions = pluck('description', tests)
    deepEqual(descriptions, [ 'test1' ])
    const { test } = tests[0]
    test()
    equal(true, executed)
  })

  it('can add beforeEach statements', () => {
    const executions = []
    suite.addBeforeEach(() => executions.push('be1'))

    suite.addTest('t1', () => executions.push('t1'))
    suite.addTest('t2', () => executions.push('t2'))
    const tests = suite.generateTests()
    return executeInSequence(tests)
      .then(() => deepEqual(executions, [ 'be1', 't1', 'be1', 't2' ]))
  })

  it('can add afterEach statements', () => {
    const executions = []
    suite.addAfterEach(() => executions.push('ae1'))

    suite.addTest('t1', () => executions.push('t1'))
    suite.addTest('t2', () => executions.push('t2'))
    const tests = suite.generateTests()
    return executeInSequence(tests)
      .then(() => deepEqual(executions, [ 't1', 'ae1', 't2', 'ae1' ]))
  })

  it('can have multiple before/after each statements', () => {
    const executions = []
    suite.addBeforeEach(() => executions.push('be1'))
    suite.addAfterEach(() => executions.push('ae1'))
    suite.addBeforeEach(() => executions.push('be2'))
    suite.addAfterEach(() => executions.push('ae2'))

    suite.addTest('t1', () => executions.push('t1'))
    suite.addTest('t2', () => executions.push('t2'))
    const tests = suite.generateTests()
    return executeInSequence(tests)
      .then(() => deepEqual(executions, [ 'be1', 'be2', 't1', 'ae1', 'ae2', 'be1', 'be2', 't2', 'ae1', 'ae2' ]))
  })

  it('handles async functions', () => {
    const executions = []
    suite.addBeforeEach(waitThen(() => executions.push('be1')))
    suite.addAfterEach(() => executions.push('ae1'))
    suite.addBeforeEach(() => executions.push('be2'))
    suite.addAfterEach(waitThen(() => executions.push('ae2')))

    suite.addTest('t1', () => executions.push('t1'))
    suite.addTest('t2', () => executions.push('t2'))
    const tests = suite.generateTests()
    return tests[0].test().then(() => tests[1].test())
      .then(() => {
        deepEqual(executions, [ 'be1', 'be2', 't1', 'ae1', 'ae2', 'be1', 'be2', 't2', 'ae1', 'ae2' ])
      })
  })
})
