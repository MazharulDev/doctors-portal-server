const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port=process.env.PORT||5000;

const app=express();

// Middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.do32r.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run(){
    try{
        await client.connect();
        const treatmentCollection=client.db('treatment').collection('service');
        
        app.get('/service',async (req,res)=>{
            const query={};
            const cursor=treatmentCollection.find(query);
            const services=await cursor.toArray();
            res.send(services);
        });
    }
    
    
    finally{

    }
}

run().catch(console.dir)



app.get('/',(req,res)=>{
    res.send('doctors portal is running')
});
app.listen(port,()=>{
    console.log("Listening to port",port);
})