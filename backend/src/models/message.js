import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    room:{
        type:String,
        required:true,
        index:true
    },
    username:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    time:{
        type:String,
        required:true
    }}
    ,{timestamps:true}
);

export default mongoose.model("message", messageSchema);