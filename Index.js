const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// middleware 
app.use(cors());
app.use(express.json());

// mongoDB connet uri 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.akdywg4.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        // create database collection 
        const Brand = client.db('oldCar').collection('brand');

        
        console.log("DB connect")
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("Hello from Old Car!")
})

app.listen(port, () => {
    console.log(`Old Car app listening on port ${port}`)
})


