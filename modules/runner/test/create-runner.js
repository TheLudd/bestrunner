import { assert } from 'chai'
import { Readable } from 'stream'
import createRunner from '../lib/create-runner'

const { deepEqual } = assert
function createTestStream (tests) {
  return new Readable({
    objectMode: true,
    read () {
      tests.forEach((t) => this.push(t))
      this.push(null)
    },
  })
}

function assertStream (stream, expected) {
  return Promise.resolve().then(() => {
    const result = []
    stream.on('data', (d) => result.push(d))
    stream.on('end', () => {
      deepEqual(result, expected)
    })
  })
}

describe('createRunner', () => {
  it('executes the test', () => {
    const runner = createRunner({
      runTest: (test) => Promise.resolve(`${test} executed`),
    })
    const resultStream = createTestStream([ 'test1' ])
      .pipe(runner)
    return assertStream(resultStream, [ 'test1 executed' ])
  })

  it('allows for pre test hooks', () => {
    const runner = createRunner({
      preHooks: [
        (test) => Promise.resolve(`${test} added and then`),
      ],
      runTest: (test) => Promise.resolve(`${test} executed`),
    })
    const resultStream = createTestStream([ 'test1' ])
      .pipe(runner)
    return assertStream(resultStream, [ 'test1 added and then executed' ])
  })

  it('allows for post test hooks', () => {
    const runner = createRunner({
      postHooks: [
        (test) => Promise.resolve(`${test} and then analyzed`),
      ],
      runTest: (test) => Promise.resolve(`${test} executed`),
    })
    const resultStream = createTestStream([ 'test1' ])
      .pipe(runner)
    return assertStream(resultStream, [ 'test1 executed and then analyzed' ])
  })

  describe('acceptance tests -', () => {
    let runner
    beforeEach(() => {
      runner = createRunner({
        preHooks: [
          (test) => (`${test} added,`),
        ],
        postHooks: [
          (test) => (`${test} and then analyzed`),
        ],
        runTest: (test) => Promise.resolve(`${test} executed`),
      })
    })
    it('allows sync pre and post hooks', () => {
      const resultStream = createTestStream([ 'test1' ])
        .pipe(runner)
      return assertStream(resultStream, [ 'test1 added, executed and then analyzed' ])
    })

    it('runs multiple tests', () => {
      const resultStream = createTestStream([ 'test1', 'test2', 'test3' ])
        .pipe(runner)
      return assertStream(resultStream, [
        'test1 added, executed and then analyzed',
        'test2 added, executed and then analyzed',
        'test3 added, executed and then analyzed',
      ])
    })
  })
})
