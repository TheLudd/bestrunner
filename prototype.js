/* eslint-disable max-classes-per-file */
require('clear-console')()
require('@babel/register')({
  presets: [ '@babel/preset-env' ],
})
require('colors')
const chai = require('chai')
const Promise = require('bluebird')
const { times } = require('ramda')
const { Readable, Writable, Transform } = require('stream')
const runTest = require('./modules/runner/lib/run-test').default
const createRunner = require('./modules/runner/lib/create-runner').default

const { equal } = chai.assert

function writeAtLine (row, text) {
  process.stdout.write(`\x1B[${row};0f\x1B[K${text}`)
}

function writeAtColumn (nbr, text) {
  const { columns } = process.stdout
  const row = Math.floor(nbr / columns) + 1
  const column = nbr % columns
  process.stdout.write(`\x1B[${row};${column}f${text}`)
}

// eslint-disable-next-line new-parens
const tester = new class extends Readable {
  constructor () {
    super({ objectMode: true })
    this.index = 0
    this.tests = []
  }

  addTest (description, test) {
    this.tests.push({ description, test })
  }

  _read (size) {
    for (let i = 0; i < size && this.index < this.tests.length; i++) {
      const { index } = this
      const { test, description } = this.tests[index]
      this.push({
        description,
        nbr: this.index + 1,
        size: this.tests.length,
        test,
      })
      this.index++
    }
    if (this.index === this.tests.length) {
      this.push(null)
    }
  }
}

function createPerLineLogger () {
  function logQueue (d) {
    const { nbr, size } = d
    writeAtLine(nbr, `Waiting (${nbr}/${size})`.cyan)
    return Promise.resolve(d)
  }

  function logPreRun (d) {
    const { nbr, size, description } = d
    writeAtLine(nbr, `Running ${description} (${nbr}/${size})`.yellow)
    return Promise.resolve(d)
  }

  function formatResult (d) {
    const {
      description,
      nbr,
      size,
      status,
    } = d
    if (status === 'Error') {
      const { error } = d
      return `${status}   ${description} (${nbr}/${size}) - ${error.message}`.red
    }

    return `${d.status}  ${description} (${nbr}/${size})`.green
  }

  function getOffset ({ size }) {
    return size
  }

  function logResult (d) {
    const { nbr } = d
    writeAtLine(nbr, formatResult(d))
    return Promise.resolve(d)
  }

  return {
    getOffset,
    logQueue,
    logPreRun,
    logResult,
  }
}

function creatDotLogger () {
  function logQueue (d) {
    const { nbr } = d
    writeAtColumn(nbr, '.'.cyan)
    return Promise.resolve(d)
  }

  function logPreRun (d) {
    const { nbr } = d
    writeAtColumn(nbr, '.'.yellow)
    return Promise.resolve(d)
  }

  function formatResult (d) {
    const { status } = d
    if (status === 'Error') {
      return '.'.red
    }

    return '.'.green
  }

  function getOffset ({ size }) {
    return Math.floor(size / process.stdout.columns) + 1
  }

  function logResult (d) {
    const { nbr } = d
    writeAtColumn(nbr, formatResult(d))
    return Promise.resolve(d)
  }

  return {
    getOffset,
    logQueue,
    logPreRun,
    logResult,
  }
}

class Summarize extends Transform {
  constructor () {
    super({ objectMode: true })
    this.startTime = Date.now()
    this.nbrCompleted = 0
    this.nbrPassed = 0
    this.nbrErrors = 0
    this.errors = []
  }

  _transform (d, _, cb) {
    const { status } = d
    this.nbrCompleted++
    if (status === 'passed') {
      this.nbrPassed++
    } else {
      this.errors.push(d)
      this.nbrErrors++
    }

    cb(null, {
      ...d,
      errors: this.errors,
      nbrCompleted: this.nbrCompleted,
      nbrErrors: this.nbrErrors,
      nbrPassed: this.nbrPassed,
    })
  }
}

class SummaryLogger extends Writable {
  constructor (opts) {
    super({ objectMode: true })
    this.startTime = Date.now()
    this.getOffset = opts.getOffset
  }

  _write (d, _, cb) {
    const {
      errors,
      nbrCompleted,
      nbrErrors,
      nbrPassed,
      size,
    } = d

    const offset = this.getOffset(d)
    const color = nbrErrors === 0 ? 'green' : 'red'
    writeAtLine(offset + 2, `${size} tests`.cyan)
    writeAtLine(offset + 3, `${size - nbrCompleted} running`.cyan)
    writeAtLine(offset + 4, `Time: ${Date.now() - this.startTime} ms`[color])
    writeAtLine(offset + 5, `${nbrPassed} passed`.green)
    writeAtLine(offset + 6, `${nbrErrors} errors`[color])

    errors.forEach((item, i) => {
      const { description, error } = item
      writeAtLine(offset + 8 + i, `${description} - ${error.message}`.red)
    })

    cb()
  }
}

const perLine = false
const {
  getOffset,
  logPreRun,
  logQueue,
  logResult,
} = perLine ? createPerLineLogger() : creatDotLogger()

const w = createRunner({
  preHooks: [ logQueue, logPreRun ],
  runTest,
  postHooks: [ logResult ],
})

tester.pipe(w).pipe(new Summarize()).pipe(new SummaryLogger({ getOffset }))

const delay = 0
function work () {
  return Promise.delay(Math.floor(Math.random() * delay))
    .then(() => {
      equal(1, 1)
    })
}

function fail () {
  return Promise.delay(Math.floor(Math.random() * delay))
    .then(() => {
      equal(1, 2)
    })
}

times((i) => {
  if (Math.random() > 0.999) {
    tester.addTest(`Test ${i}`, fail)
  } else {
    tester.addTest(`Test ${i}`, work)
  }
}, 4000)
