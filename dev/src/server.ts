/* eslint-disable import/no-import-module-exports */
import express from 'express'
import type { Server } from 'http'
import payload from 'payload'
import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

export const start = async (args: { local: boolean } = { local: false }): Promise<Server> => {
  const { local } = args
  await payload.init({
    local,
    secret: process.env.PAYLOAD_SECRET,
    mongoURL: process.env.MONGODB_URI,
    express: app,
  })

  return app.listen(3000)
}

// when build.js is launched directly
if (module.id === require.main.id) {
  start()
}
