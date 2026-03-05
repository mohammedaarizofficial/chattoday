import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./config/connectdb.js";
import {Server} from 'socket.io';
import http from 'http';
import message from "./models/message.js";
import userRouter from "./routes/users.routes.js";
import users from "./models/users.js";

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

io.on('connection', (socket)=>{
    console.log('A user connected:', socket.id);

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id);
    })

    socket.on("hello", (data)=>{
        console.log("Received:", data);
        socket.emit("reply", "this is from the server");
    })

    socket.on("join", async({username,password})=>{
        socket.username=username;

        const userDetails = await users.findOne({username},{password:1, room:1, _id:0});

        if(!userDetails){
            socket.emit('logOut');
            return;
        }
        if(userDetails.password !== password){
            socket.emit('logOut');
            return;
        }

        const room = userDetails.room;
        socket.room = room;
        socket.join(room);

        const messages = await message.find({room}).sort({createdAt:1});

        const rooms = await message.distinct("room");
        io.emit("getRooms", rooms);

        socket.emit("previousMessages", messages);

        socket.broadcast.to(room).emit("receiveMessage",{
            username:"System",
            message:`${username} has joined the chat`,
            time:new Date().toLocaleTimeString(),
        });

        socket.emit('loginSuccess', room);
    });

    socket.on("getRooms", async()=>{
        const rooms = await message.distinct("room");

        io.emit("getRooms", rooms);
    })

    socket.on("sendMessage", async(data)=>{
        console.log("Message:", data);
        const newMessage = await message.create(data);

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
