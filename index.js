const express = require('express')
const cors=require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 1824;


app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vkhsa2w.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
      return res.status(401).send({error: true, message: 'unauthorized access'});
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded)=>{
      if(err){
          return res.status(401).send({error: true, message: 'unauthorized access'})
      }
      req.decoded = decoded;
      next();
  })
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    

const AllToys=client.db('MangaAnime').collection('allToys');
const AddAToyCollection=client.db('MangaAnimeClient').collection('addAToy');

// jwt
app.post('/jwt', (req, res) => {
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
  console.log(token);
  res.send({token});
})

app.get('/all',async(req,res)=>{
  const cursor=AllToys.find();
  const result=await cursor.toArray();
  res.send(result);
      
})

app.get('/all/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result=await AllToys.findOne(query);
  res.send(result);
})

// app.get('/all/:name',async(req,res)=>{

//   const name=req.params.name;
//    const query={name:name}
//    const result= await AllToys.findOne(query);
//    res.send(result);
//  })


const allt=client.db('categoryAll').collection('all');
app.get('/category',async(req,res)=>{
  const cursor=allt.find();
  const result=await cursor.toArray();
  res.send(result);
      
})

app.get('/category/:category',async(req,res)=>{

 const id=req.params.category;
  const query={category:id}
  const cursor= allt.find(query);
  const result=await cursor.toArray();
  res.send(result);
})

app.get('/category/:category/:id',async(req,res)=>{
  const id=req.params.id;
  console.log(id);
  const query={_id: new ObjectId(id)}
  const result=await allt.findOne(query);
  res.send(result);
})


// app.get('/addAToy',async(req,res)=>{
//   const result=await AddAToyCollection.find().toArray();
 
//   res.send(result);
// })


app.get('/addAToy',verifyJWT, async(req,res)=>{

  const decoded = req.decoded;
  console.log('came back after verify', decoded)

  // if(decoded.email !== req.query.email){
  //     return res.status(403).send({error: 1, message: 'forbidden access'})
  // }

  let query = {};
  if (req.query?.email) {
      query = { email: req.query.email }
  }
  const result = await AddAToyCollection.find(query).toArray();
  res.send(result);
})

 
//  app.get('/addAToyID/:id',async(req,res)=>{

//   const id=req.params.id;
//   const query={_id: new ObjectId(id)}
//    const result= AddAToyCollection.findOne(query);
 
//    res.send(result);
//  })


// Include Add a toy
 app.post('/addAToy',async(req,res)=>{
  const addAToy=req.body;
  console.log(addAToy);
  const result=await  AddAToyCollection.insertOne(addAToy);
  res.send(result);
});


 app.delete('/addAToy/:id',async(req,res)=>{
  const id=req.params.id;
  const query={ _id :new ObjectId(id)}
  const result=await AddAToyCollection.deleteOne(query);
  res.send(result);
 });


//  app.put('/addAToy/:id',async(req,res)=>{
//   const id=req.params.id;
//   const query={_id:new ObjectId(id)}
//   const updateToys=req.body;
//  })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
  res.send('Manga Anime Shop Server Running')
})

app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`)
})