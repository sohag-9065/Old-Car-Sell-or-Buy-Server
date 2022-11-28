const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
        const Category = client.db('oldCar').collection('brandCategory');
        const usersCollection = client.db('oldCar').collection('users');


        // user token generate by email 
        app.get('/user/token/:email', async (req, res) => {
            const email = req.params.email;
            console.log("token: ",email);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // user token generate by email 
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            console.log("email: ", email);
            console.log("user: ",user);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ result, token });
        })

        // get all brand info 
        app.get('/brand', async (req, res) => {

            const query = {}
            const carBrandInfo = await Brand.find(query).toArray();
            res.send(carBrandInfo);
        })


        // get all brand Category  
        app.get('/category', async (req, res) => {

            const query = {}
            const carCategory = await Category.find(query).toArray();
            res.send(carCategory);
        })

        // get  products by  Category  
        app.get('/category/:name', async (req, res) => {
            const name = req.params.name;
            const query = {
                categotyName: name,
                booked: ""
            }
            // console.log("name: ", name);
            // console.log(query);
            const singleCarCategory = await Category.find(query).toArray();
            res.send(singleCarCategory);
        })

        // update products 
        app.patch('/category/:id', async (req, res) => {
            const id = req.params.id;
            const brandName = req.body
            console.log(review);
            // console.log(id)
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: { booked: 'Yes' }
            }
            const result = await Category.updateOne(query, updatedDoc);

            const carBrandInfo = await Brand.find(brandName).toArray();

            console.log(carBrandInfo)
            res.send(result);
        })

        // get  products by  Advertised  
        app.get('/advertised', async (req, res) => {
            const name = req.params.name;
            const query = {
                advertised: "Yes",
                booked: ""
            }
            const advertisedCategory = await Category.find(query).toArray();
            res.send(advertisedCategory);
        })



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


