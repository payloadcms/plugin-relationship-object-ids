import { buildConfig } from 'payload/config'
import path from 'path'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { relationshipsAsObjectID } from '../../src'

export default buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    bundler: webpackBundler(),
  },
  editor: lexicalEditor(),
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    schemaOptions: {
      strict: false,
    },
    jsonParse: false,
  }),
  collections: [
    {
      slug: 'uploads',
      upload: true,
      fields: [],
    },
    {
      slug: 'pages',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'posts',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      slug: 'relations',
      fields: [
        {
          name: 'hasOne',
          type: 'relationship',
          relationTo: 'posts',
        },
        {
          name: 'hasOnePoly',
          type: 'relationship',
          relationTo: ['pages', 'posts'],
        },
        {
          name: 'hasMany',
          type: 'relationship',
          relationTo: 'posts',
          hasMany: true,
        },
        {
          name: 'hasManyPoly',
          type: 'relationship',
          relationTo: ['pages', 'posts'],
          hasMany: true,
        },
        {
          name: 'upload',
          type: 'upload',
          relationTo: 'uploads',
        },
      ],
    },
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  plugins: [relationshipsAsObjectID()],
  onInit: async payload => {
    await payload.create({
      collection: 'users',
      data: {
        email: 'dev@payloadcms.com',
        password: 'test',
      },
    })

    const page = await payload.create({
      collection: 'pages',
      data: {
        title: 'page',
      },
    })

    const post1 = await payload.create({
      collection: 'posts',
      data: {
        title: 'post 1',
      },
    })

    const post2 = await payload.create({
      collection: 'posts',
      data: {
        title: 'post 2',
      },
    })

    const upload = await payload.create({
      collection: 'uploads',
      data: {},
      filePath: path.resolve(__dirname, './payload-logo.png'),
    })

    await payload.create({
      collection: 'relations',
      depth: 0,
      data: {
        hasOne: post1.id,
        hasOnePoly: { relationTo: 'pages', value: page.id },
        hasMany: [post1.id, post2.id],
        hasManyPoly: [
          { relationTo: 'posts', value: post1.id },
          { relationTo: 'pages', value: page.id },
        ],
        upload: upload.id,
      },
    })

    await payload.create({
      collection: 'relations',
      depth: 0,
      data: {
        hasOnePoly: { relationTo: 'pages', value: page.id },
      },
    })
  },
})
