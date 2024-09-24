const express = require("express");
var cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const messagesApi = require(".messegesApi.js");

const hostname = "127.0.0.1";
const port = 3003;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/messages", messagesApi);

//Set up connection to MongoDB
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

app.post("/destinations", (req, res) => {
    // send back the created object or at least the new ID
    console.log(req.body);
    createDestination(req.body);
    res.send("Got a POST request");
});

app.get("/destinations", (req, res) => {
    getAllDestinations();
    res.send("Getting travel destinations");
});

// app.get("/destinations/:id", (req, res) => {
//   console.log("params", req.params);
//   res.send("Getting travel destinations");
// });

app.put("/destinations/:id", (req, res) => {
    console.log("Updating destination with this id", req.params.id);
    console.log("New data", req.body);
    updateDestination(req.params.id, req.body);
    res.send(`Got a PUT request to update destination with id ${req.params.id}`);
});

app.delete("/destinations/:id", (req, res) => {
    console.log("delete destination with this id", req.params.id);
    res.send("Got a DELETE request at /destinations");
    deleteDestination(req.params.id);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

async function createDestination(newDestination) {
    try {
        // Connect the client to the server (optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const myDB = client.db("travel");
        const myColl = myDB.collection("destinations");

        const result = await myColl.insertOne(newDestination);
        console.log(`A document was inserted with the _id: ${result.insertedId}`);
        console.log("result object", result);
        return result;
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}

async function getAllDestinations() {
    try {
        // Connect the client to the server
        await client.connect();
        const myDB = client.db("travel");
        const myColl = myDB.collection("destinations");

        const destinations = await myColl.find({}).toArray();
        console.log(destinations);
        return destinations;
    } finally {
        await client.close();
    }
}

async function deleteDestination(destinationId) {
    try {
        // Connect the client to the server
        await client.connect();
        const myDB = client.db("travel");
        const myColl = myDB.collection("destinations");

        // Safely create an OBjectId from the string Id
        const query = {
            _id: ObjectId.isValid(destinationId) ? new ObjectId(destinationId) : null,
        };

        if (!query._id) {
            console.log("Invalid format.");
            return; // Exit early if the Id is not valid
        }
        const result = await myColl.deleteOne(query);
        if (result.deletedCount === 1) {
            console.log(`Destination with id ${destinationId} deleted`, query);
        } else {
            console.log(`Destination with id ${destinationId} not found`);
        }
    } finally {
        await client.close();
    }
}

async function updateDestination(destinationId, newData) {
    try {
        // Connect the client to the server
        await client.connect();
        const myDB = client.db("travel");
        const myColl = myDB.collection("destinations");

        // Safely create an ObjectId from the string Id
        const query = {
            _id: ObjectId.isValid(destinationId) ? new ObjectId(destinationId) : null,
        };

        if (!query._id) {
            console.log("Invalid format.");
            return; // Exit early if the Id is not valid
        }

        // Create the update operation
        const update = {
            $set: newData,
        };

        // Update the document
        const result = await myColl.updateOne(query, update);

        if (result.matchedCount === 1) {
            console.log(`Destination with id ${destinationId} updated`, update);
        } else {
            console.log(`Destination with id ${destinationId} not found`);
        }
    } finally {
        await client.close();
    }
}
