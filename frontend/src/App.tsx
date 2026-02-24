import './App.css'
import { useState, useEffect, useRef} from 'react'
import {io} from 'socket.io-client';
import type { Socket } from 'socket.io-client';

type ChatMessage = {
  username:string,
  message:string,
  time:string
}

function App() {
  const [message, setMessage]=useState('');
  const [messages, setMessages]=useState<ChatMessage[]>([]);
  const [username, setUsername]=useState<string>('');
  const [joined, setJoined]=useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const typeTimeoutRef = useRef<number | null>(null);

  const socket = useRef<Socket | null>(null);

  useEffect(()=>{
    socket.current = io('http://localhost:5432');

    socket.current.on('connect', ()=>{
      if(!socket.current) return;
      console.log('Connected to the server', socket.current.id);
      socket.current.emit("hello", "this is the frontend");
    })

    socket.current.on('receiveMessage', (data)=>{
      setMessages((prev)=>[...prev,data]);
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

  const sendMessage = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!socket.current) return;
    if(!message.trim()||!username.trim()) return

    const msgData={
      username, 
      message, 
      time:new Date().toLocaleTimeString(),
    }

    socket.current.emit("sendMessage", msgData);
    setMessage('');

  }

  const joinChat = ()=>{
    if(!socket.current) return;
    if(!username.trim())return;

    socket.current.emit("join", username);
    setJoined(true);
  }

  return (<>
    {!joined ? (
      <div className='bg-dark text-light'>
        <h2>Enter Chat</h2>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={joinChat}>Join</button>
      </div>
    ):(
    <>
    <div className="container-fluid bg-dark text-light">
      <form onSubmit={sendMessage}>
        <label htmlFor="usernameBox">
          Enter Username:
          <input className="username" type='text' placeholder="Enter username"
          value={username}
          onChange={(e)=>setUsername(e.target.value)} />
        </label>
        <label htmlFor="messageBox">
          Enter message:
          <input className="message" type="text" placeholder="enter your message" value={message} onChange={(e)=>{
            setMessage(e.target.value)
            if(socket.current){
              socket.current.emit("typing", username);
            }}}/>
        </label>
        <button type='submit'>Send</button>
      </form>
      {typingUser && typingUser !== username && (
        <div style={{ fontStyle: "italic", color: "gray" }}>
          {typingUser} is typing...
        </div>
      )}
        <main>
      {messages.map((message, index)=>(
        
          <div key={index} className="card bg-dark" style={{textAlign:message.username === username ? "right" : "left",
            color:message.username === username?"green":"white"
          }}>
            <h1>{message.username}</h1>
            <h1>{message.message}</h1>
            <h3>{message.time}</h3>
          </div>
      ))}
      </main>
    </div></>)}
    </>
  )
}

export default App
