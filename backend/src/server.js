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

const normalizeRoomName = (room)=>{
    if(typeof room !== "string") return room;
    if(!room.includes("_")) return room;
    const parts = room.split("_").filter(Boolean);
    if(parts.length !== 2) return room;
    return parts.sort().join("_");
}

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
    // Personal room so we can always reach this user (for private chat invites/messages)
    if (socket.username) {
        socket.join(socket.username);
    }

    socket.on('disconnect', ()=>{
        console.log('User disconnected', socket.id);
    })


    const messages = await message.find({room}).sort({createdAt:1});

    const allRooms = await message.distinct("room");

    const userRooms = allRooms.filter(room =>
    room.includes(socket.username)
    );

    socket.emit("conversationsList", userRooms);

    socket.emit("previousMessages", messages);

    socket.broadcast.to(room).emit("receiveMessage",{
        username:"System",
        message:`${socket.username} has joined the chat`,
        time:new Date().toLocaleTimeString(),
    });


    socket.on("getRooms", async()=>{
       const allRooms = await message.distinct("room");

        const userRooms = allRooms.filter(room =>
        room.includes(socket.username)
        );

        socket.emit("conversationsList", userRooms);
    })

    socket.on("getUsers", async()=>{
        const Users = await users.find({}, {password:0,room:0,_id:0});
        const userName = Users.map(u =>u.username);
        socket.emit("usersList", userName);
    })

    socket.on("sendMessage", async(data)=>{
        // Always normalize private room names so we don't create both "a_b" and "b_a"
        socket.room = normalizeRoomName(socket.room);
        const msgData = {
            username: socket.username,
            room: socket.room,
            message: data.message,
            time: data.time
    };
        console.log("Message:", data);
        const newMessage = await message.create(msgData);

        io.to(socket.room).emit("receiveMessage", newMessage);

        // Private rooms are named like "alice_bob". Forward new private messages to the
        // other user's personal room so they receive it even if they haven't joined yet.
        if (typeof socket.room === "string" && socket.room.includes("_")) {
            const otherUser = socket.room.split("_").find(u => u !== socket.username);
            if (otherUser) {
                io.to(otherUser).emit("receiveMessage", newMessage);
                io.to(otherUser).emit("conversationsList", [socket.room]);
            }
        }
    })

    socket.on("typing", (username)=>{
        socket.broadcast.to(socket.room).emit("userTyping", username);
    })

    socket.on("startPrivateChat", ({to})=>{
        const from = socket.username;
        const room = normalizeRoomName([from, to].join("_"));

        socket.join(room);
        socket.room = room;

        // ✅ FORCE EMIT so frontend updates
        socket.emit("chatStarted", {room});
        socket.emit("conversationsList", [room]); // show in starter sidebar

        // Also notify the recipient so the chat appears in their sidebar immediately
        io.to(to).emit("conversationsList", [room]);
        io.to(to).emit("privateChatStarted", { room, from });
    });

    socket.on("joinRoom", async(room)=>{
        const normalized = normalizeRoomName(room);
        socket.join(normalized);
        socket.room = normalized;

        const messages = await message.find({room: normalized}).sort({createdAt:1});
        socket.emit("previousMessages", messages);
    });
    
})

app.use(express.json());
app.use('/users', userRouter);

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`);
})
