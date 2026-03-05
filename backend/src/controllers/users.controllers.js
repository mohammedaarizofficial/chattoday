import Users from "../models/users.js";

export const createUser = async(req, res)=>{  
    try{
        const data = new Users({
            room:req.body.room,
            username:req.body.username,
            password:req.body.password
        })
        const updatedData = await data.save();
        res.status(201).json({
            room:updatedData.room,
            username:updatedData.username,
            password:updatedData.password
        })
    }catch(err){
        console.log(err);
    }
}