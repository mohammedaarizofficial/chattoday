import { useState, useEffect, useRef} from 'react'
import {io} from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';

interface MessagePageProps{
    username:string,
    room:string,
    setSocket:React.Dispatch<React.SetStateAction<Socket|null>>
}

type ChatMessage = {
  room:string,
  username:string,
  message:string,
  time:string
}

function MessagePage({username,room,setSocket}:MessagePageProps){
    const [message, setMessage]=useState('');
    const [messages, setMessages]=useState<ChatMessage[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typeTimeoutRef = useRef<number | null>(null);
    const [availableRooms, setAvailableRooms]=useState<string[]>([]);

    const socket = useRef<Socket | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();

    useEffect(()=>{
        socket.current = io('http://localhost:5432');
        setSocket(socket.current);
        socket.current.on('connect', ()=>{
        if(!socket.current) return;
        console.log('Connected to the server', socket.current.id);
        socket.current.emit("hello", "this is the frontend");
        })

        socket.current.on('receiveMessage', (data)=>{
        setMessages((prev)=>[...prev,data]);
        })

        socket.current.on("previousMessages", (msgs) => {
        setMessages(msgs);
        });

        socket.current.on("availableRooms", (rooms)=>{
        setAvailableRooms(rooms);
        })

        socket.current.on('disconnect', ()=>{
        if(!socket.current) return;
        console.log('Disconnected from the server', socket.current.id);
        })

        socket.current.on("connect_error", (err) => {
        console.log("❌ Connection error:", err.message)
        })

        socket.current.on('reply', (data)=>{
        console.log("Received from server:", data);
        })

        socket.current.on("userTyping", (username:string)=>{
        setTypingUser(username);

        if(typeTimeoutRef.current){
            clearTimeout(typeTimeoutRef.current);
        }

        typeTimeoutRef.current = window.setTimeout(()=>{
            setTypingUser(null);
            },1500);
        });

        return ()=>{
        if(!socket.current) return;
        socket.current.disconnect();
        }
    },[])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  })

  const sendMessage = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!socket.current) return;
    if(!message.trim()||!username.trim()) return

    const msgData={
      room,
      username, 
      message, 
      time:new Date().toLocaleTimeString(),
    }

    socket.current.emit("sendMessage", msgData);
    setMessage('');
  }

    return(
        <>
        <div className="container-fluid vh-100 bg-dark text-light" style={{height:"100%"}}>
            <div className="row">
                <div className="col-2 vh-100 d-flex flex-column vh-100 border-end border-secondary-subtle">
                <div className="nav-header mt-2 text-center">Rooms</div>
                <hr></hr>
                {availableRooms.map((rooms)=>(
                    <div className="nav-body">{rooms}</div>
                ))}
                <div className="mt-auto mb-2 text-center">
                    <Button variant='text' onClick={()=>navigate('/')}>Log Out</Button>
                </div>
                </div>
                <div className='col-10 d-flex flex-column vh-100'>
                <h1 className="bg-dark text-center text-light py-3 m-0">You are in room: {room}</h1>

                    {typingUser && typingUser !== username && (
                    <div style={{ fontStyle: "italic", color: "gray" }}>
                        {typingUser} is typing...
                    </div>
                    )}
                    <main className="flex-grow-1 overflow-auto px-3">
                    {messages.map((message, index)=>(
                    <div className="d-flex my-3" key={index} style={{justifyContent:message.username===username?"flex-end":"flex-start"
                    }}>
                        <div className="rounded-pill my-2 px-5 py-2 rounded-pill" style={{
                        backgroundColor:message.username === username?"green":"transparent",
                        border:message.username===username?"none":"1px solid white",
                        width:"fit-content",
                        maxWidth:"60%"
                        }}>
                        <h1 >{message.username}</h1>
                        <h1>{message.message}</h1>
                        <h3>{message.time}</h3>
                        </div>
                    </div>
                    ))}
                    <div ref={bottomRef}></div>
                    </main>
                    <form onSubmit={sendMessage} className='py-3 border-top '>
                    <div className="d-flex">
                    <label htmlFor="messageBox">
                        Enter message:
                        <input className="message" type="text" placeholder="enter your message" value={message} onChange={(e)=>{
                        setMessage(e.target.value)
                        if(socket.current){
                            socket.current.emit("typing", username);
                        }}}/>
                    </label>
                    <Button variant="contained" type="submit" className="mx-3 rounded-pill">send</Button>
                    </div>
                    </form>
                </div>
            </div>
        </div>
        </>
    )
}

export default MessagePage;