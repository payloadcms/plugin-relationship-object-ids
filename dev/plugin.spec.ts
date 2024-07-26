import payload from 'payload'
import type { Post, Relation } from 'payload/generated-types'
import { start } from './src/server'

describe('Plugin tests', () => {
  let relations: Relation[]
  let posts: Post[]

  beforeAll(async () => {
    await start({ local: true })
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
    const docs = await payload.db.collections.relations.find()
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

    expect(totalDocs).toStrictEqual(1)
  })
})
