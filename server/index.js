const fastify = require('fastify')({ logger: true });
const path = require('node:path');
const { uniqueNamesGenerator, adjectives, animals } = require('unique-names-generator');
const { MongoClient, ServerApiVersion } = require("mongodb");
const createStory = require('./openai');

fastify.register(require('@fastify/formbody'));
fastify.register(require('@fastify/static'), { root: path.join(__dirname, '') });
fastify.register(require("@fastify/view"), { engine: { ejs: require("ejs") } });

const client = new MongoClient(process.env.CC_MONGO_DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}
);

fastify.get('/', async (_request, reply) => {
  return reply.sendFile('form.html')
})

fastify.post('/create', async (request, reply) => {
  const newId = uniqueNamesGenerator({
    dictionaries: [adjectives, adjectives, animals],
    style: 'capital',
    separator: "",
  });
  console.log(`ID is ${newId}`)

  const { yourPremise } = request.body;

  let story;
  let success = false;
  let attempts = 0;

  while (!success) {
    try {
      story = await createStory(newId, yourPremise);
      success = true; // Set success to true to break out of the loop
    } catch (error) {
      attempts++;
      console.error(`Error creating story: ${error.message}, attempt: ${attempts}`);
    }
  }

  await client.db("cuentacuentos").collection('stories').insertOne({ id: newId, title: story.title, panels: story.panels, status: "finished" });
  reply.redirect(`/${newId}`);
});

fastify.get('/:id', async (request, reply) => {
  const { id } = request.params;
  const doc = await client.db("cuentacuentos").collection('stories').findOne({ "id": id })
  if (!doc) {
    return reply.code(404).send({ error: 'Not Found' });
  }
  console.log('DOC', doc);

  return reply.view("story.ejs", { story: doc });
});

fastify.get('/output.css', async (_request, reply) => {
  return reply.sendFile('output.css')
})

const port = process.env.PORT || 3000;
const host = ("RENDER" in process.env) ? `0.0.0.0` : `localhost`;
const start = async () => {
  try {
    await client.connect();
    await fastify.listen({ host, port })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
