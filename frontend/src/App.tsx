import './App.css';
import { useState,useEffect,useRef} from 'react';
import { Socket } from 'socket.io-client';
import Loginpage from './pages/Loginpage';
import {Routes, Route} from 'react-router-dom';
import {io} from 'socket.io-client';
import RegisterPage from './pages/RegisterPage';
import MessagePage from './pages/MessagePage';
import { useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

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
  const [logOut, setLogOut]=useState<boolean>(false);
    const [messages, setMessages]=useState<ChatMessage[]>([]);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const typeTimeoutRef = useRef<number | null>(null);
    const [availableRooms, setAvailableRooms]=useState<string[]>([]);

    const socket = useRef<Socket | null>(null);
    const bottomRef = useRef<HTMLDivElement | null>(null);


    useEffect(()=>{
  if(!socket.current) return;

  socket.current.on('receiveMessage',(data)=>{
    setMessages((prev)=>[...prev,data]);
  });

  socket.current.on("previousMessages",(msgs)=>{
    setMessages(msgs);
  });

  socket.current.on("getRooms",(rooms)=>{
    setAvailableRooms(rooms);
  });

  socket.current.on("availableRooms",(rooms)=>{
    setAvailableRooms(rooms);
  });

  socket.current.on("userTyping",(username:string)=>{
    setTypingUser(username);

    if(typeTimeoutRef.current){
      clearTimeout(typeTimeoutRef.current);
    }

    typeTimeoutRef.current = window.setTimeout(()=>{
      setTypingUser(null);
    },1500);
  });

  socket.current.on("connect_error",(err)=>{
    console.log("❌ Connection error:", err.message);
  });

  return ()=>{
    socket.current?.off("receiveMessage");
    socket.current?.off("previousMessages");
    socket.current?.off("getRooms");
    socket.current?.off("availableRooms");
    socket.current?.off("userTyping");
  };

},[socket.current]);

  useEffect(()=>{
    if(room){
      navigate('/message');
    }
  },[room])

  if(logOut){
    localStorage.removeItem('token');
    navigate('/');
  }

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage = (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!socket.current) return;
    if(!message.trim()||!username.trim()) return

    const msgData={
      username,
      room,
      message, 
      time:new Date().toLocaleTimeString(),
    }

    socket.current.emit("sendMessage", msgData);
    setMessage('');
  }


  const joinChat = async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();

    const res = await fetch("http://localhost:5432/users/login",{
      method:"POST",
      headers:{'Content-type':'application/json'},
      body:JSON.stringify({username,password})
    })
    const data = await res.json();
    console.log("TOKEN:", data.token);

    localStorage.setItem('token', data.token);


      // create socket AFTER login
    socket.current = io("http://localhost:5432",{
      auth:{ token:data.token }
    });

    socket.current.on("connect",()=>{
      console.log("Connected:",socket.current?.id);
      socket.current?.emit("getRooms");
    });

    setPassword('');
    navigate('/message');
  }

  useEffect(()=>{
  const token = localStorage.getItem("token");

  if(!token) return;

  socket.current = io("http://localhost:5432",{
    auth:{token}
  });

  socket.current.on("connect",()=>{
    console.log("Reconnected with token");
    socket.current?.emit("getRooms");
  });

},[]);


  return (<>
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Routes>
          <Route path="/register" element={<RegisterPage availableRooms={availableRooms}/>} />
          <Route path="/" element={<Loginpage username={username} setUsername={setUsername} password={password} setPassword={setPassword} joinChat={joinChat}/>} />
          <Route path="/message" element={
            <ProtectedRoute>
              <MessagePage 
              room={room} 
              username={username} 
              availableRooms={availableRooms} 
              typingUser={typingUser} 
              messages={messages} 
              setMessage={setMessage}
              bottomRef={bottomRef} 
              sendMessage={sendMessage} 
              message={message} 
              socket={socket}
              setLogOut={setLogOut}
              />
          </ProtectedRoute>
          }/>
        </Routes>
      </div>
      </>
  )
}

export default App
