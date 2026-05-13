import users from "../models/users.js";
import Users from "../models/users.js";
import jwt from 'jsonwebtoken'

export const createUser = async(req, res)=>{  
    try{
        const existingUser = await Users.findOne({
            username:req.body.username
        });

        if(existingUser){
            return res.status(400).json({
                message:"Username already exists"
            });
        }

        const data = new Users({
            username:req.body.username,
            password:req.body.password
        });

        const updatedData = await data.save();

        const token = jwt.sign(
            {
                username:updatedData.username,
                room:updatedData.room
            },
            process.env.JWT_SECRET,
            {expiresIn:'1h'}
        );

        return res.status(201).json({
            token,
            username:updatedData.username,
            room:updatedData.room
        });

    }catch(err){
        console.log(err);

        return res.status(500).json({
            message:"Server error"
        });
    }
}

export const loginUser = async(req, res)=>{
    const {username, password} = req.body;

    const user = await users.findOne({username});

    if(!user || user.password !== password){
        return res.status(401).json({message:'Invalid username or password'});
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

    return res.json(msgData);
}