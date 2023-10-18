//dependencies
const express=require('express');
const mongoose=require('mongoose');
const JWT=require('jsonwebtoken')
const dotenv=require('dotenv')
const cors=require('cors')
const SALE=require('./models/SALE')
const USER=require('./models/USER')
const app=express();
const verifyToken=require('./middlewere/verifyToken')

dotenv.config()
//connecting mongoose
mongoose.connect(process.env.DB_URI)
.then(()=>console.log("DB connected"))
.catch((err)=>console.log(err));

app.use(express.json());
app.use(cors());

app.post('/api/signup', async(req,res)=>{
  try {
      const newUser= new USER(req.body)
      await newUser.save()
      res.send({...newUser._doc})
  } catch (error) {
  res.send(error)
      
  }
})

app.post('/api/signin', async(req,res)=>{
  try {
      const user= await USER.findOne({email: req.body.email})

      if(!user)
      return res.status(400).json("user not found")
    if(req.body.password===user.password)
    isCorrect=true

      if(isCorrect){
          const {password, ...others}=user._doc
          const token=JWT.sign({id: user._id},process.env.JWT)
          res.send({...others,token})

      }else{
          res.status(400).send("password not matched")
      }


  } catch (error) {
  res.send(error.message)
      
  }
})

// Create a new sale
app.post('/api/sales',verifyToken, async (req, res) => {
  const data=req.body
  data.userId=req.data.id
  console.log(data)
    try {
      const sale = new SALE(data);
      await sale.save();
      res.status(201).json(sale);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all sales
  app.get('/api/sales',verifyToken, async (req, res) => {
    try {
      const sales = await SALE.find({userId: req.data.id}).sort({'createdAt': -1});
      res.status(200).json(sales);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get a specific sale by ID
  app.get('/api/sales/:id',verifyToken, async (req, res) => {
    try {
      const sale = await SALE.findById(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: 'SALE not found' });
      }
      res.status(200).json(sale);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Update a sale by ID
  app.put('/api/sales/:id',verifyToken, async (req, res) => {

    try {
      const sale = await SALE.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!sale) {
        return res.status(404).json({ message: 'SALE not found' });
      }
      res.status(200).json(sale);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a sale by ID
  app.delete('/api/sales/:id',verifyToken, async (req, res) => {
    try {
      const sale = await SALE.findByIdAndRemove(req.params.id);
      if (!sale) {
        return res.status(404).json({ message: 'SALE not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  


app.listen(process.env.PORT || 5000,()=>{
    console.log("server started at port 8000")
});