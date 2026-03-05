import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./config/connectdb.js";
import {Server} from 'socket.io';
import http from 'http';
import message from "./models/message.js";
import userRouter from "./routes/users.routes.js";
import users from "./models/users.js";
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT;
app.use(cors());

const io = new Server(server, {
    cors:{
        origin:'http://localhost:5173',
        methods:["GET", "POST"]
    }
})

connectdb();

io.use((socket,next)=>{
    const token = socket.handshake.auth.token;

    if(!token) return next(new Error("Authentication error"));

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("DECODED TOKEN:", decoded);

        socket.username = decoded.username;
        socket.room = decoded.room;

        next();
    }catch(err){
        next(new Error("Authentication error"));
    }
})

io.on('connection', async(socket)=>{

    const room = socket.room;

    socket.join(room);

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id);
    })


    const messages = await message.find({room}).sort({createdAt:1});

    const rooms = await message.distinct("room");

    io.emit("getRooms", rooms);

    socket.emit("previousMessages", messages);

    socket.broadcast.to(room).emit("receiveMessage",{
        username:"System",
        message:`${socket.username} has joined the chat`,
        time:new Date().toLocaleTimeString(),
    });


    socket.on("getRooms", async()=>{
        const rooms = await message.distinct("room");

        io.emit("getRooms", rooms);
    })

    socket.on("sendMessage", async(data)=>{
        const msgData = {
        username: socket.username,
        room: socket.room,
        message: data.message,
        time: data.time
    };
        console.log("Message:", data);
        const newMessage = await message.create(msgData);

        io.to(socket.room).emit("receiveMessage", newMessage);
    })

    socket.on("typing", (username)=>{
        socket.broadcast.to(socket.room).emit("userTyping", username);
    })
    
})

app.use(express.json());
app.use('/users', userRouter);

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})
