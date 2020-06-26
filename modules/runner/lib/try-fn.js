export default function tryFn (fn) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn())
    } catch (e) {
      reject(e)
    }
  })
}
