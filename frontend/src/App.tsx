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
  _id?: string,
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
  const [usersList, setUsersList]=useState<string[]>([]);
  const [addUser, setAddUser]=useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  const socket = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const currentRoomRef = useRef<string>("");
  console.log(`selected room is ${selectedRoom}`)

    const createSocket = (token:string)=>{
      socket.current = io("http://localhost:5432",{
        auth:{token}
      })
  }

  useEffect(()=>{
    if(room){
      navigate('/message');
    }
  },[room])

  useEffect(()=>{
    currentRoomRef.current = room;
  },[room]);

  if(logOut){
    localStorage.removeItem('token');
    navigate('/');
  }

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage = (text:string)=>{
    if(!socket.current) return;
    if(!text.trim()) return

    const msgData={
      username,
      room,
      message:text, 
      time:new Date().toLocaleTimeString(),
    }

    socket.current.emit("sendMessage", msgData);
    setMessage('');
  }

  const mergeUniqueById = (prev:ChatMessage[], incoming:ChatMessage[])=>{
    const seen = new Set<string>();
    const out:ChatMessage[] = [];
    const push = (m:ChatMessage)=>{
      const id = m?._id;
      if (id) {
        if (seen.has(id)) return;
        seen.add(id);
      }
      out.push(m);
    };
    // preserve order: existing first, then new arrivals
    prev.forEach(push);
    incoming.forEach(push);
    return out;
  }


  const joinChat = async (e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();

    const res = await fetch("http://localhost:5432/users/login",{
      method:"POST",
      headers:{'Content-type':'application/json'},
      body:JSON.stringify({username,password})
    });

    const data = await res.json();

    setUsername(data.username);

    localStorage.setItem("token", data.token);
    setRoom(data.room);

    socket.current = io("http://localhost:5432",{
      auth:{ token:data.token }
    });

    socket.current.on("usersList",(data)=>{
      setUsersList(data);
    })

    socket.current.on("getRooms",(rooms)=>{
      setAvailableRooms(rooms);
    });

    socket.current.on("conversationsList",(rooms)=>{
      setAvailableRooms(prev => [...new Set([...prev, ...rooms])]);
    });

    socket.current.on("chatStarted", (data)=>{
      setRoom(data.room);
      setSelectedRoom(data.room);
      setMessages([]);
    })

    socket.current.on("privateChatStarted", ({ room })=>{
      if (!room) return;
      setAvailableRooms(prev => [...new Set([...prev, room])]);
    });

    // attach listeners immediately
    socket.current.on("connect",()=>{
      console.log("Connected:", socket.current?.id);
      socket.current?.emit("getRooms");
      socket.current?.emit("getUsers");
      socket.current?.emit("getConversations");
    });

    socket.current.on("receiveMessage",(data)=>{
      // Only append messages for the currently active room
      if (data?.room && data.room !== currentRoomRef.current) return;
      setMessages(prev => mergeUniqueById(prev, [data]));
    });

    socket.current.on("previousMessages",(msgs)=>{
      setMessages(() => mergeUniqueById([], msgs));
    });

    socket.current.emit("getUsers");

    socket.current.on("userTyping",(username:string)=>{
      setTypingUser(username);

      if(typeTimeoutRef.current){
        clearTimeout(typeTimeoutRef.current);
      }

      typeTimeoutRef.current = window.setTimeout(()=>{
        setTypingUser(null);
      },1500);
    });

    setPassword("");
    navigate("/message");
  };

  useEffect(()=>{
    const token = localStorage.getItem("token");

    if(!token) return;

    socket.current = io("http://localhost:5432",{
      auth:{token}
    });

    socket.current.on("usersList",(data)=>{
      setUsersList(data);
    })

    socket.current.on("connect",()=>{
      console.log("Reconnected with token");
      socket.current?.emit("getRooms");
    });

    socket.current.on("getRooms",(rooms)=>{
      setAvailableRooms(rooms);
    });

    socket.current.on("privateChatStarted", ({ room })=>{
      if (!room) return;
      setAvailableRooms(prev => [...new Set([...prev, room])]);
    });


    socket.current.on("chatStarted", (data)=>{
      setRoom(data.room);
      setSelectedRoom(data.room);
      setMessages([]);
    })

    socket.current.emit("getConversations");

    socket.current.on("conversationsList",(rooms)=>{
      setAvailableRooms(prev => [...new Set([...prev, ...rooms])]);
    });

  },[]);



  return (<>
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Routes>
          <Route path="/register" element={
            <RegisterPage 
            availableRooms={availableRooms}
            createSocket={createSocket}
            />} />
          <Route path="/" element={
            <Loginpage 
              username={username} 
              setUsername={setUsername} 
              password={password} 
              setPassword={setPassword} 
              joinChat={joinChat}/>} 
            />
          <Route path="/message" element={
            <ProtectedRoute>
              <MessagePage 
              selectedRoom={selectedRoom}
              username={username} 
              availableRooms={availableRooms} 
              typingUser={typingUser} 
              messages={messages} 
              setMessage={setMessage}
              sendMessage={sendMessage} 
              message={message} 
              socket={socket}
              setLogOut={setLogOut}
              usersList={usersList}
              setAddUser={setAddUser}
              addUser={addUser}
              setRoom={setRoom}
              setSelectedRoom={setSelectedRoom}
            />
          </ProtectedRoute>
          }/>
        </Routes>
      </div>
      </>
  )
}

export default App
