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
  const [addUser, setAddUser]=useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [loginError, setLoginError] = useState<string>("");

  const socket = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const currentRoomRef = useRef<string>("");
  const listenersBoundRef = useRef(false);

  const attachSocketListeners = (activeSocket: Socket) => {
    if (listenersBoundRef.current) return;
    listenersBoundRef.current = true;

    activeSocket.on("connect",()=>{
      activeSocket.emit("getRooms");
      activeSocket.emit("getUsers");
    });

    activeSocket.on("usersList",(data)=>{
      setUsersList(data);
    });

    activeSocket.on("conversationsList",(rooms:string[])=>{
      setAvailableRooms(prev => [...new Set([...prev, ...rooms])]);
    });

    activeSocket.on("chatStarted", (data:{room:string})=>{
      setRoom(data.room);
      setSelectedRoom(data.room);
      setMessages([]);
      activeSocket.emit("joinRoom", data.room);
    });

    activeSocket.on("privateChatStarted", ({ room })=>{
      if (!room) return;
      setAvailableRooms(prev => [...new Set([...prev, room])]);
    });

    activeSocket.on("groupChatStarted", ({ room })=>{
      if (!room) return;
      setAvailableRooms(prev => [...new Set([...prev, room])]);
    });

    activeSocket.on("groupRenamed", ({ oldRoom, newRoom }) => {
      if (!oldRoom || !newRoom) return;
      setAvailableRooms((prev) => {
        const replaced = prev.map((r) => (r === oldRoom ? newRoom : r));
        return [...new Set(replaced)];
      });
      setMessages((prev) => prev.map((msg) => (
        msg.room === oldRoom ? { ...msg, room: newRoom } : msg
      )));
      setRoom((prev) => (prev === oldRoom ? newRoom : prev));
      setSelectedRoom((prev) => {
        if (prev !== oldRoom) return prev;
        activeSocket.emit("joinRoom", newRoom);
        return newRoom;
      });
    });

    activeSocket.on("groupRenameError", ({ message }:{message:string}) => {
      // Keep this simple for now; can be replaced with a toast later.
      window.alert(message || "Unable to rename group.");
    });

    activeSocket.on("receiveMessage",(data:ChatMessage)=>{
      if (data?.room && data.room !== currentRoomRef.current) return;
      setMessages(prev => mergeUniqueById(prev, [data]));
    });

    activeSocket.on("previousMessages",(msgs:ChatMessage[])=>{
      setMessages(() => mergeUniqueById([], msgs));
    });

    activeSocket.on("userTyping",(username:string)=>{
      setTypingUser(username);
      if(typeTimeoutRef.current){
        clearTimeout(typeTimeoutRef.current);
      }
      typeTimeoutRef.current = window.setTimeout(()=>{
        setTypingUser(null);
      },1500);
    });
  };

  const createSocket = (token:string)=>{
    if (socket.current) {
      socket.current.disconnect();
      socket.current = null;
      listenersBoundRef.current = false;
    }
    const nextSocket = io("http://localhost:5432",{
      auth:{token}
    });
    socket.current = nextSocket;
    attachSocketListeners(nextSocket);
  }

  useEffect(()=>{
    if(room){
      navigate('/message');
    }
  },[room])

  useEffect(()=>{
    currentRoomRef.current = selectedRoom;
  },[selectedRoom]);

  if(logOut){
    localStorage.removeItem('token');
    navigate('/');
  }

  useEffect(()=>{
    bottomRef.current?.scrollIntoView({behavior:"smooth"});
  },[messages]);

  const sendMessage = (text:string)=>{
  if(!socket.current || !selectedRoom) return;

  const msgData={
    username,
    room: selectedRoom, // ✅ FIX
    message:text, 
    time:new Date().toLocaleTimeString(),
  };

  socket.current.emit("sendMessage", msgData);
  setMessage('');
};

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
    setLoginError("");

    const res = await fetch("http://localhost:5432/users/login",{
      method:"POST",
      headers:{'Content-type':'application/json'},
      body:JSON.stringify({username,password})
    });

    const data = await res.json();
    if (!res.ok) {
      setLoginError(data?.message || "Unable to login. Please try again.");
      return;
    }

    setUsername(data.username);

    localStorage.setItem("token", data.token);
    setRoom(data.room);

    createSocket(data.token);

    setPassword("");
    navigate("/message");
  };

  useEffect(()=>{
    const token = localStorage.getItem("token");

    if(!token) return;

    createSocket(token);

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
        listenersBoundRef.current = false;
      }
    };
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
              joinChat={joinChat}
              loginError={loginError}/>} 
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
