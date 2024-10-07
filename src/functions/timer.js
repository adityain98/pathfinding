export default (ms) => {
  return new Promise(res => setTimeout(res, ms))
}