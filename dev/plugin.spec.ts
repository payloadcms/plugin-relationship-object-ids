import type { Server } from 'http'
import mongoose from 'mongoose'
import payload from 'payload'
import type { Post, Relation } from 'payload/generated-types'
import { start } from './src/server'

describe('Plugin tests', () => {
  let relations: Relation[]
  let posts: Post[]
  let server: Server

  beforeAll(async () => {
    server = await start({ local: true })
  }, 20000)

  afterAll(async () => {
    await mongoose.connection.dropDatabase()
    await mongoose.connection.close()
    server.close()
  })

  it('seeds data accordingly', async () => {
    const relationsQuery = await payload.find({
      collection: 'relations',
      sort: 'createdAt',
    })

    relations = relationsQuery.docs

    const postsQuery = await payload.find({
      collection: 'posts',
      sort: 'createdAt',
    })

    posts = postsQuery.docs

    expect(relationsQuery.totalDocs).toEqual(2)
    expect(postsQuery.totalDocs).toEqual(2)
  })

  it('stores relations as object ids', async () => {
    const relationsQuery = await payload.find({
      collection: 'relations',
      sort: 'createdAt',
    })

    const docs = relationsQuery.docs

    expect(typeof docs[0].hasOne).toBe('object')
    expect(typeof docs[0].hasOnePoly.value).toBe('object')
    expect(typeof docs[0].hasMany[0]).toBe('object')
    expect(typeof docs[0].hasManyPoly[0].value).toBe('object')
    expect(typeof docs[0].upload).toBe('object')
  })

  it('can query by relationship id', async () => {
    const { totalDocs } = await payload.find({
      collection: 'relations',
      where: {
        hasOne: {
          equals: posts[0].id,
        },
      },
    })

    expect(totalDocs).toStrictEqual(1)
  })

  it('populates relations', async () => {
    const populatedPostTitle =
      typeof relations[0].hasOne === 'object' ? relations[0].hasOne.title : undefined
    expect(populatedPostTitle).toBeDefined()

    const populatedUploadFilename =
      typeof relations[0].upload === 'object' ? relations[0].upload.filename : undefined

    expect(populatedUploadFilename).toBeDefined()
  })

  it('can query by nested property', async () => {
    const { totalDocs } = await payload.find({
      collection: 'relations',
      where: {
        'hasOne.title': {
          equals: 'post 1',
        },
      },
    })

    expect(totalDocs).toStrictEqual(1)
  })

  it('can query using the "in" operator', async () => {
    const { totalDocs } = await payload.find({
      collection: 'relations',
      where: {
        hasMany: {
          in: [posts[0].id],
        },
      },
    })
  })

  it('populates parent relations', async () => {
    const r1 = await payload.find({
      collection: 'relations',
    })

    const r2 = await payload.create({
      collection: 'relations', // required
      data: {
        parent: r1.docs[0],
      },
    })
  })
})
