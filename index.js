const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
        const bookingCollection=client.db('treatment').collection('booking');
        const userCollection=client.db('treatment').collection('user');
        // all service show
        app.get('/service',async (req,res)=>{
            const query={};
            const cursor=treatmentCollection.find(query);
            const services=await cursor.toArray();
            res.send(services);
        });
        // user info
        app.put('/user/:email',async(req,res)=>{
            const email=req.params.email;
            const user=req.body;
            const filter={email: email};
            const options={upsert:true};
            const updateDoc={
                $set:user,
            };
            const result=await userCollection.updateOne(filter,updateDoc,options);
            const token=jwt.sign({email:email},process.env.ACCESS_TOKEN,{expiresIn:'1d'})
            res.send({result,accessToken:token});
        })
        // booking api
        app.post('/booking',async(req,res)=>{
            const booking=req.body;
            const result=await bookingCollection.insertOne(booking);
            res.send(result);
        })
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