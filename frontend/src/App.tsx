import './App.css';
import { useState,useEffect,useRef} from 'react';
import { Socket } from 'socket.io-client';
import Loginpage from './pages/Loginpage';
import {Routes, Route} from 'react-router-dom';
import {io} from 'socket.io-client';
import RegisterPage from './pages/RegisterPage';
import MessagePage from './pages/MessagePage';
import { useNavigate } from 'react-router-dom';

type ChatMessage = {
  room:string,
  username:string,
  message:string,
  time:string
}

function App() {
  const [username, setUsername]=useState<string>('');
  const [password, setPassword]=useState<string>('');
  const [room, setRoom]=useState<string>('');
  const navigate = useNavigate();
  const [message, setMessage]=useState('');
    const [messages, setMessages]=useState<ChatMessage[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typeTimeoutRef = useRef<number | null>(null);
    const [availableRooms, setAvailableRooms]=useState<string[]>([]);

    const socket = useRef<Socket | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);


    useEffect(()=>{
        socket.current = io('http://localhost:5432');
        socket.current.on('connect', ()=>{
        if(!socket.current) return;
        console.log('Connected to the server', socket.current.id);
        socket.current.emit("hello", "this is the frontend");
        socket.current.emit('getRooms');
        })

        socket.current.on('receiveMessage', (data)=>{
        setMessages((prev)=>[...prev,data]);
        })

        socket.current.on("previousMessages", (msgs) => {
        setMessages(msgs);
        });

        socket.current.on('getRooms',(rooms)=>{
          setAvailableRooms(rooms);
        })

        socket.current.on("availableRooms", (rooms)=>{
        setAvailableRooms(rooms);
        })

        socket.current.on('logOut', ()=>{
          navigate('/');
        })

        socket.current.on('loginSuccess', (room)=>{
          setRoom(room);
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
    if(room){
      navigate('/message');
    }
  },[room])

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

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


  const joinChat = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!socket.current) return;
    if(!username.trim()||!password.trim())return;

    socket.current.emit("join", {username,password});
  }



  return (<>
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Routes>
          <Route path="/register" element={<RegisterPage availableRooms={availableRooms}/>} />
          <Route path="/" element={<Loginpage username={username} setUsername={setUsername} password={password} setPassword={setPassword} joinChat={joinChat}/>} />
          <Route path="/message" element={<MessagePage room={room} username={username} availableRooms={availableRooms} typingUser={typingUser} messages={messages} setMessage={setMessage}
          bottomRef={bottomRef} sendMessage={sendMessage} message={message} socket={socket}/>}/>
        </Routes>
      </div>
      </>
  )
}

export default App
