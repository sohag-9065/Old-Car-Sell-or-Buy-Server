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


// authorization check unction 
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log("first")
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        // create database collection 
        const Brand = client.db('oldCar').collection('brand');
        const Category = client.db('oldCar').collection('brandCategory');
        const usersCollection = client.db('oldCar').collection('users');
        const ordersCollection = client.db('oldCar').collection('myOrders');


        // user token generate by email 
        app.get('/user/token/:email', async (req, res) => {
            const email = req.params.email;
            // console.log("token: ", email);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
            res.send({ token });
        })

        // Update user Information 
        app.put('/user/info/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
          ////  console.log("email: ", email);
            // console.log("user: ", user);
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            if(user.verified){
              //  console.log(user.verified)
                const userProducts = await Category.find({sellerEmail: email}).toArray();
              //  console.log(userProducts);
                const query = {sellerEmail: email};

                const updatedDoc = {
                    $set: {verified: "Yes"}
                }
                const result = await Category.updateMany(query, updatedDoc);
              //  console.log("user verified: ",result);

            }

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })

        // get user status 
        app.get('/user/status/:email', async (req, res) => {
            const email = req.params.email;
         //  console.log("status: ",email)
            const user = await usersCollection.findOne({ email: email });
         //  console.log("Status", user); 
            return res.send(user);
        })

         // get all seller 
         app.get('/sellers', async (req, res) => {
            const query = { status: "Seller" }
            const seller = await usersCollection.find(query).toArray();
            return res.send(seller);
        })

        // get all buyers 
        app.get('/buyers', async (req, res) => {
            const query = { status: "Buyers" }
            const seller = await usersCollection.find(query).toArray();
            return res.send(seller);
        })

        // Delete user  ( buyers || sellers)
        app.delete('/user/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await usersCollection.deleteOne(filter);
            res.send(result);
        });



        // get all brand info 
        app.get('/brand', async (req, res) => {

            const query = {}
            const carBrandInfo = await Brand.find(query).toArray();
            res.send(carBrandInfo);
        })

        // get update brand quantity 
        app.patch('/brand/:categotyName', async (req, res) => {
            const categotyName = req.params?.categotyName;
            const action = req.body.action;
        //  console.log(("128 brand categotyName: ", categotyName)
            const query = {categotyName: categotyName}
            const carBrandInfo = await Brand.findOne(query);
          ////  console.log(carBrandInfo);
       //  console.log(("132 carBrandInfo ", carBrandInfo )
          const options = { upsert: true };
            let quantity = 1;
            if(action === "increment"){
                quantity = parseInt(carBrandInfo?.quantity) + 1;
            }
            else{
                quantity = parseInt(carBrandInfo?.quantity) - 1;
            }

            const updateDoc = {
                $set: {quantity: quantity},
            };
            const result = await Brand.updateOne(query, updateDoc, options);
         //  console.log(("145 result ", result )
            // console.log(result)
            res.send(result);
        })


        // get Products 
        app.get('/category', async (req, res) => {

            const query = {}
            const carCategory = await Category.find(query).toArray();
            res.send(carCategory);
        })

        

        // get  products by  Seller  
        app.get('/category/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { sellerEmail: email }
            // console.log(query);
            const singleCarCategory = await Category.find(query).toArray();
            res.send(singleCarCategory);
        })

        // get  products by  Category  
        app.get('/category/:name', async (req, res) => {
            const name = req.params.name;
            const query = { 
                categotyName: name ,
                payment: ""
            }
            // console.log(query);
            const singleCarCategory = await Category.find(query).toArray();
            res.send(singleCarCategory);
        })

        // get  all reported products  
        app.get('/category/reported/all', async (req, res) => {
            const query = { reported: "Yes" }
            // console.log(query);
            const reportedCar = await Category.find(query).toArray();
            res.send(reportedCar);
        })

        // add Product 
        app.post('/category/add', async (req, res) => {
            const product = req.body;
            // console.log("product: ", product);
            const result = await Category.insertOne(product);
            res.send(result);
        });

        // update products info
        app.patch('/category/:id', async (req, res) => {
            const id = req.params.id;
            const updateInfo = req.body;
            // console.log(review);
            // console.log(id)
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: updateInfo
            }
            const result = await Category.updateOne(query, updatedDoc);

            // console.log(carBrandInfo)
            res.send(result);
        })


         //  Delete product
         app.delete('/category/:id', async (req, res) => {
            const id = req.params.id;
         //  console.log((id)
            const filter = { _id: ObjectId(id) };
            const result = await Category.deleteOne(filter);
            res.send(result);
        });


        // get user orders 
        app.get('/order/:email', async (req, res) => {
            const email = req.params.email;
            const query = { BuyerEmail: email }
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        });

        // add user orders 
        app.post('/order/add', async (req, res) => {
            const order = req.body;
            // console.log(order);
            const result = await ordersCollection.insertOne(order);
            res.send(result);
        });

        //  Delete order
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(filter);
            res.send(result);
        });

        // get all buyers for single user 

         // get user orders 
         app.get('/buyers/:email', async (req, res) => {
            const email = req.params.email;
            const query = { ProductSellerEmail: email }
            const result = await ordersCollection.find(query).toArray();
            res.send(result);
        });


        // get  products by  Advertised  
        app.get('/advertised', async (req, res) => {
            const name = req.params.name;
            const query = {
                advertised: "Yes",
                payment: ""
            }
            const advertisedCategory = await Category.find(query).toArray();
            res.send(advertisedCategory);
        })



         // update products info and order info
         app.patch('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const ProductId = req?.body?.ProductId;
         //  console.log("id: ", id)
            const query = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: { payment: 'Yes' }
            }
            const result = await ordersCollection.updateOne(query, updatedDoc);
            const filter = { _id: ObjectId(ProductId) }

            const payment = await Category.updateOne(filter, updatedDoc);

            res.send(result);
        })



   //  console.log(("DB connect")
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


