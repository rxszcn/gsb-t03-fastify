// 复现：底层通道先写两条 Cookie，之后从回复对象再写一条，前面那两条就没了
const Fastify = require('../')

const f = Fastify()

f.get('/merge', async (req, reply) => {
  reply.raw.setHeader('set-cookie', ['sid=abc', 'theme=dark'])
  reply.header('set-cookie', 'theme=light')
  return 'ok'
})

f.get('/stream', (req, reply) => {
  reply.raw.setHeader('set-cookie', ['sid=abc', 'lang=zh'])
  reply.header('set-cookie', 'theme=light')
  reply.header('content-type', 'text/plain')
  reply.send(require('stream').Readable.from(['chunk-1']))
})

;(async () => {
  for (const u of ['/merge', '/stream']) {
    const r = await f.inject({ method: 'GET', url: u })
    console.log(u, r.statusCode, 'set-cookie =', JSON.stringify(r.headers['set-cookie']))
  }
  await f.close()
})()
