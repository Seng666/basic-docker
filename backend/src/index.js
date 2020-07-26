`use strict`
var Koa = require('koa');
var Router = require('koa-router');
const { MongoClient } = require('mongodb')

var app = new Koa();
var router = new Router();

router
  .get('/insert/:name', async (ctx, next) => {
    // insert name parameter to db
    const { name } = ctx.params

    const db = mongo(ctx)
    const collection = db.collection('names')

    // insert name to the collection
    await collection.insertOne({ name })

    ctx.status = 200
    ctx.body = name
  })
  .get('/names', async (ctx, next) => {
    // get all logged names
    const db = mongo(ctx)
    const collection = db.collection('names')
    const names = await collection.find().toArray()

    ctx.body = names
    ctx.status = 200
  })

app
  .use(postgresMiddleware())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3000)
console.log('server listening at port 3000')
function postgresMiddleware() {
  const mongoUrl = 'mongodb://mongoadmin:secret@mongodb:27017'
  const dbName = 'mydb1'
  let client = undefined
  return async (ctx, next) => {
    if (client === undefined)
      client = await MongoClient.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true })
    
    // attach db object to context
    ctx._db = client.db(dbName)
    return await next()
  }
}

function mongo(ctx) {
  return ctx._db
}