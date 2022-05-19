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

function verifyJWT(req,res,next){
    const authHeader=req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message:'unauthorize access'})
    }
    const token=authHeader.split(' ')[1];
    jwt.verify(token,process.env.ACCESS_TOKEN,function(err,decoded){
        if(err){
            return res.status(403).send({message:'Forbidden access'})
        }
        req.decoded=decoded;
        next()
    });
}

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
        });
        //user show
        app.get('/user',verifyJWT, async(req,res)=>{
            const users=await userCollection.find().toArray()
            res.send(users);
        })
        // available treatment
        // app.get('/available',async(req,res)=>{
        //     const date=req.query.date;
        //     const services=await treatmentCollection.find().toArray();
        //     const query={date:date};
        //     const bookings=await bookingCollection.find(query).toArray();
        //     services.forEach(service=>{
        //         const serviceBookings=bookings.filter(book.treatment===service.name);
        //         const bookedSlots=serviceBookings.map(book=>book.slot);
        //         const available=service.slots.filter(slot=>!bookedSlots.includes(slot))
        //         service.slots=available;
        //     });
        //     res.send(services);
        // });
		
        // booking api
        app.post('/booking',async(req,res)=>{
            const booking=req.body;
            const query={treatment:booking.treatment,date:booking.date,patient:booking.patient}
            const exists=await bookingCollection.findOne(query);
            if(exists){
                return res.send({success:false,booking:exists})
            }
            const result=await bookingCollection.insertOne(booking);
            return res.send({success:true, result});
        })
        //booking show
        app.get('/booking',verifyJWT, async(req,res)=>{
        	const patient=req.query.patient;
            const decodedEmail=req.decoded.email;
            if(patient===decodedEmail){
                const query={patient: patient};
                const bookings=await bookingCollection.find(query).toArray();
                res.send(bookings);
            }else{
                return res.status(403).send({message:'Forbidden access'});
            }
        
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
