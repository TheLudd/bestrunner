import { assert } from 'chai'
import runTest from '../lib/run-test'

const { equal, deepEqual } = assert

describe('runTest', () => {
  describe('for passing functions', () => {
    const syncPassingFunction = () => 1
    it('adds the status passed', () => (
      runTest({ test: syncPassingFunction })
        .then((result) => {
          const expected = { test: syncPassingFunction, status: 'passed' }
          deepEqual(result, expected)
        })
    ))

    it('keeps any other props', () => (
      runTest({ test: syncPassingFunction, foo: 'bar' })
        .then((result) => {
          const expected = { test: syncPassingFunction, status: 'passed', foo: 'bar' }
          deepEqual(result, expected)
        })
    ))

    it('executes async functions', () => {
      let called = false
      function asyncPassingFunction () {
        return Promise.resolve()
          .then(() => {
            called = true
          })
      }
      return runTest({ test: asyncPassingFunction })
        .then(() => equal(true, called))
    })
  })

  describe('for failing functions', () => {
    const failError = new Error('fail')
    function syncFailingFunction () {
      throw failError
    }
    it('adds the status error and the error object', () => (
      runTest({ test: syncFailingFunction })
        .then((result) => {
          const expected = { test: syncFailingFunction, status: 'error', error: failError }
          deepEqual(result, expected)
        })
    ))

    it('keeps any other props', () => (
      runTest({ test: syncFailingFunction, foo: 'bar' })
        .then((result) => {
          const expected = {
            error: failError,
            foo: 'bar',
            status: 'error',
            test: syncFailingFunction,
          }
          deepEqual(result, expected)
        })
    ))

    it('adds async rejected errors', () => {
      function asyncFalingFunction () {
        return Promise.reject(failError)
      }
      return runTest({ test: asyncFalingFunction })
        .then((result) => {
          const expected = {
            error: failError,
            status: 'error',
            test: asyncFalingFunction,
          }
          deepEqual(result, expected)
        })
    })
  })

  it('adds an empty object as this', () => {
    let thisValue
    function thisSpy () {
      thisValue = this
    }
    return runTest({ test: thisSpy })
      .then(() => {
        deepEqual(thisValue, {})
      })
  })
})
