import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    room:{
        type:String,
        required:true,
    },
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true,
    }
},{
    timestamps:true
})

export default mongoose.model("Users", userSchema);