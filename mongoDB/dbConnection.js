require('dotenv').config();
const mongoUri = process.env.MONGO_URI;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = mongoUri; 
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// console.log("Mongo URI:---->", mongoUri); 

async function connectToDB() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    
    return client;
  } catch(error) {
    console.log(error, "<-----error from dbConnection.js line 27");
  }
  // finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  // }
}
connectToDB().catch(console.dir);

module.exports = connectToDB;