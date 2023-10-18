const mongoose=require('mongoose');

//product model
const saleSchema= new mongoose.Schema(

    {
        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref: "USER"
        },
        productId:{
            type: String,
            required:true
        },
        name:{
            type:String,
            reqired:true
        },
        sale_amount:{
            type:Number,
            required:true,
            
        },
        quantity:{
            type:Number,
            required:true 
        }
        
    },{timestamps:true}

)

module.exports=mongoose.model("SALE", saleSchema);