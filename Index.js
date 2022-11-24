const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT;

// middleware 
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello from Old Car!")
})

app.listen(port, () => {
    console.log(`Old Car app listening on port ${port}`)
})


