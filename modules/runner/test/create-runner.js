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
    assertStream(resultStream, [ 'test1 executed' ])
  })
})
