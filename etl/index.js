const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = 'mongodb://localhost:27017'
const limit = 50
const headers = { 'X-Requested-With': 'XMLHttpRequest'  }
const rp = require('request-promise-native')

const doWork = async () => {
  const connection = await MongoClient.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  const db = await connection.db('calisthenics-parks')
  const parksCollection = await db.collection('parks')
  await parksCollection.deleteMany({})
  await doRequest(1, parksCollection)
}

const doRequest = async (page, parksCollection) => {
  console.log(page)
  const options = {
    url: `https://calisthenics-parks.com/spots?order=id&limit=${limit}&page=${page}`,
    headers,
    json: true
  }
  const result = await rp(options)
  const { data, totalPages, currentPage } = cleanResult(result)
  await parksCollection.insertMany(data)
  if (currentPage === totalPages) return
  const newPage = currentPage + 1
  return doRequest(newPage, parksCollection)
}

const cleanResult = result => (
  {
    totalPages: result.paginator.total_pages,
    currentPage: result.paginator.current_page,
    data: result.data.map(x => ({
      id: x.id,
      name: x.name,
      title: x.title,
      address: x.address,
      geometry: {
        type: 'Point',
        coordinates: [x.lon, x.lat]
      },
      properties: {
        id: x.id,
        name: x.name
      }
    }))
  }
)

doWork().then(() => console.log('finished'))
