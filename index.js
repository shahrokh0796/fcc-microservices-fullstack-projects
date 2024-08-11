const express = require('express');
const app = express();
const connectToDB = require('./mongoDB/dbConnection');
const cors = require('cors');
const { ObjectId } = require("mongodb");

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST to /api/users username 
app.post("/api/users", async (req, res) => {
  // Extract the username from the request body
  const client = await connectToDB(); // connect to mongoDB
  const collection = client.db("exerciseTrackerDB").collection("exTrackerCollection");

  const { username } = req.body;

  // Manual Validation
  if (typeof username !== 'string' || username.trim() === '') {
    return res.status(400).send({ error: "Username must not be empty string." });
  }


  try {
    // Check if the user already exist
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.status(409).send({ error: "Username already exists" });
    }

    // Insert a new document useing the data from the request
    const newUser = { username };
    // insert user into the database
    const resullt = await collection.insertOne(newUser);
    res.status(201).send({ username, userId: resullt.insertedId });
  } catch (error) {
    res.status(500).send("Error creating user");
  } finally {
    // Ensure that the client is close after the operating
    await client.close();
  }
});

// You can make a GET request to /api/users to get a list of all users.
app.get("/api/users", async (req, res) => {
  const client = await connectToDB(); // connect to the database
  const collection = client.db("exerciseTrackerDB").collection("exTrackerCollection");

  try {
    const users = await collection.find({}).toArray(); // Fetch all users
    res.status(200).send(users); // Send the list of users as a response
  } catch (error) {
    console.error("Error retrieving users: ", error); //log the error for debugging
    res.status(500).send("Error retrieveing users");
  } finally {
    await client.close(); // Ensure the client is closed after the operating
  }
});

// /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  const client = await connectToDB(); // connect to the database
  const collection = client.db("exerciseTrackerDB").collection("exTrackerCollection");
  // Get the user id from the URL parameters
  const { _id } = req.params;
  // console.log(typeof _id, "<---type of id", _id);
  // Extract exercise data from the request body
  const { description, duration, date } = req.body;

  // Manual validation
  if(!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).send({error: 'Description is required and must not be an empty string'});
  }

  if(!duration || isNaN(duration) || duration <= 0) {
    return res.status(400).send({error: "Duration is required and must be a positive interger"});
  }

  // If no date provided, use the current data
  const exerciseDate = date ? new Date(date) : new Date().toDateString();

  try {
    // check if the user exists
    const user = await collection.findOne({_id: new ObjectId(_id)});
    if(!user) {
      return res.status(404).send({error: "User not found."}); // Not found status
    }

    // if the user exists, create the exercise object
    const exercise = {
      username: user.username,
      description,
      duration,
      date: exerciseDate,
      userId: _id
    }

    // Insert the exercise data into the database using a separate exercise collection
    const exercisesCollection = client.db('exerciseTrackerDB').collection("exercises");
    // insert exercise into the exercise collection
     const result = await exercisesCollection.insertOne(exercise);
    // console.log(result, "<---- ");
    res.status(201).send({
      _id: result.insertedId,
      exercise: {
        description,
        duration,
        date: exerciseDate.toString(),
      }
    });
  } catch(error) {
    // Log the error for debugging
    console.error("Error adding exercise: ", error);
    res.status(500).send("Error adding Exercise");
  } finally {
    // Ensure the cliet is closed after the operation
    await client.close();
  }
});


// GET request to /api/users/:_id/logs
app.get("/api/users/:_id/logs", async (req, res) => {

  let { from, to, limit } = req.query;

  const client = await connectToDB();
  const collection = client.db("exerciseTrackerDB").collection("exTrackerCollection");
  const { _id } = req.params;
  try {
    // check if the user exists
    const user = await collection.findOne({_id: new ObjectId(_id)});
    if(!user) {
      // Not found status
      return res.status(404).send({ error: "User not found."});
    }

    let filter = { userId: _id };
    console.log(typeof filter.userId, "<---------typ of userId");
    let dateFilter = {};
    if(from) {
      dateFilter['$gte'] = new Date(from);
    }
    if(to) {
      dateFilter["$lte"] = new Date(to);
    }

    if(from || to) {
      filter.date = dateFilter;
    }

   limit = limit ? parseInt(limit) : 100;
   console.log(filter, "<----------filter");
    // Get exercises from the user
    const exercisesCollection = client.db('exerciseTrackerDB').collection("exercises");
    // const exercises = await exercisesCollection.find({ userId: _id }).toArray();
    const exercises = await exercisesCollection.find(filter).limit(limit).toArray();
    console.log(exercises, "<------exercises");
    // Prepare log array
    const log = exercises.map((exercise) => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toString() // Convert date to string
    }));

    // Create the response object

    res.send({
      username: user.username,
      count: log.length,
      _id,
      log
    });
    // const response = {
    //   username: user.username,
    //   count: log.length,
    //   _id: user._id,
    //   log
    // }
    // res.status(200).send(response);

  } catch(error) {
    console.log(" Error retrieving user log:  ", error);
    res.status(500).send("Error retrieving user log");
  } finally {
    // Ensure the client closed after the operation
    await client.close();
  }
});



async function main() {
  try {
    // connect to db for any iniitial setup if needed
    const client = await connectToDB();
    // Perform any initial setup or checks here if necessary
    const listener = app.listen(process.env.PORT || 3000, () => {
      console.log('Your app is listening on port ' + listener.address().port)
    });
  } catch (error) {
    console.log("Failed to start the server: ", error);
  }
}

main().catch(console.error);


