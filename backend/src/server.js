import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectdb from "./config/connectdb.js";
import {Server} from 'socket.io';
import http from 'http';

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

// app.get('/chat', async(req, res)=>{
//     res.send("Server is working");
// })

// app.listen(PORT, ()=>{
//     console.log(`Server is running at ${PORT}`);
// })

io.on('connection', (socket)=>{
    console.log('A user connected:', socket.id);

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id);
    })

    socket.on("hello", (data)=>{
        console.log("Received:", data);
        socket.emit("reply", "this is from the server");
    })
})

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})
