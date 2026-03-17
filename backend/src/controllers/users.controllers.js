import users from "../models/users.js";
import Users from "../models/users.js";
import jwt from 'jsonwebtoken'

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

export const loginUser = async(req, res)=>{
    const {username, password} = req.body;

    const user = await users.findOne({username});

    if(!user || user.password !== password){
        res.status(401).json({message:'Invalid credentials'});
    }

    const token = jwt.sign(
        {
            username:user.username,
            room:user.room
        },
        process.env.JWT_SECRET,
        {expiresIn:'1h'}
    );

    const msgData = {
        token:token,
        room:user.room,
        username:user.username
    }

    res.json(msgData);
}