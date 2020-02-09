const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = 'mongodb://localhost:27017'
const fs = require('fs')

const doWork = async () => {
  const connection = await MongoClient.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const db = await connection.db('calisthenics-parks')
  const parksCollection = await db.collection('parks')
  const allParks = await parksCollection.find({}).toArray()
  const result = {
      type: 'FeatureCollection',
      features: allParks.map(x => ({ type: 'Feature', geometry: x.geometry, properties: x.properties }))
  }
  fs.writeFileSync('parks.geojson', JSON.stringify(result))


}

doWork().then(() => console.log('finished'))
