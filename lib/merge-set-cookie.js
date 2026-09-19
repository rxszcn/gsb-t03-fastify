'use strict'

const { kReplyHeaders } = require('./symbols.js')

// set-cookie may be written through both reply.header() and the raw
// response object (e.g. legacy middleware). Each channel keeps its own
// value and the reply headers would overwrite the raw ones on flush,
// dropping cookies. Merge both channels into the raw response before
// the headers are flushed, so no cookie is lost. The reply headers are
// the single source of truth until this runs, afterwards the raw
// response is, which keeps repeated flushes (error paths) idempotent.
function mergeSetCookie (reply, res) {
  const headers = reply[kReplyHeaders]
  const cookies = headers['set-cookie']
  if (cookies === undefined) {
    return
  }

  const rawCookies = res.getHeader('set-cookie')
  if (rawCookies !== undefined) {
    const merged = Array.isArray(rawCookies) ? rawCookies.slice() : [rawCookies]
    res.setHeader('set-cookie', merged.concat(cookies))
  } else {
    res.setHeader('set-cookie', cookies)
  }

  delete headers['set-cookie']
}

module.exports = mergeSetCookie
