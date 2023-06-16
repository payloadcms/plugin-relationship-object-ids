import express from 'express'
import payload from 'payload'
import mongoose from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config()

const app = express()

// Redirect root to Admin panel
app.get('/', (_, res) => {
  res.redirect('/admin')
})

// Initialize Payload
payload.init({
  secret: process.env.PAYLOAD_SECRET,
  mongoURL: process.env.MONGODB_URI,
  express: app,
  onInit: async () => {
    mongoose.set('debug', true)
    payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
  },
})

app.listen(3000)
