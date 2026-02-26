import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./config/connectdb.js";
import {Server} from 'socket.io';
import http from 'http';
import message from "./models/message.js";

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

const availableRooms=[];

io.on('connection', (socket)=>{
    console.log('A user connected:', socket.id);

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id);
    })

    socket.on("hello", (data)=>{
        console.log("Received:", data);
        socket.emit("reply", "this is from the server");
    })

    socket.on("join", async({username,room})=>{
        socket.username=username;
        socket.room = room;
        socket.join(room);

        const messages = await message.find({room}).sort({createdAt:1});

        if(!availableRooms.includes(room)){
            availableRooms.push(room);
        }

        io.emit("availableRooms", availableRooms);

        socket.emit("previousMessages", messages);

        socket.broadcast.to(room).emit("receiveMessage",{
            username:"System",
            message:`${username} has joined the chat`,
            time:new Date().toLocaleTimeString(),
        });
    });

    socket.on("sendMessage", async(data)=>{
        console.log("Message:", data);
        const newMessage = await message.create(data);

        io.to(socket.room).emit("receiveMessage", newMessage);
    })

    socket.on("typing", (username)=>{
        socket.broadcast.to(socket.room).emit("userTyping", username);
    })
    
})

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})
