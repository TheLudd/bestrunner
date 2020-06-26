import through2 from 'through2'
// log added
// log before run
// run
// log after run
// create summary

function asyncTransform (fn) {
  return through2.obj((x, _, cb) => {
    fn(x).then((result) => cb(null, result))
  })
}

export default function createRunner (conf) {
  const { runTest } = conf
  return asyncTransform(runTest)
}
