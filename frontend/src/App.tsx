import './App.css';
import { useState} from 'react';
import { Socket } from 'socket.io-client';
import Loginpage from './pages/Loginpage';
import {Routes, Route} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import MessagePage from './pages/MessagePage';
import { useNavigate } from 'react-router-dom';

function App() {
  const [username, setUsername]=useState<string>('');
  const [joined, setJoined]=useState<boolean>(false);
  const [room, setRoom]=useState<string>('');
  const [socket, setSocket]=useState<Socket | null>(null);
  const navigate = useNavigate();

  const joinChat = (e)=>{
    e.preventDefault();
    if(!socket) return;
    if(!username.trim()||!room.trim())return;

    socket.emit("join", {username,room});
    setJoined(true);
    navigate('/message');

  }

  return (<>
    {!joined ? (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark">
        <Routes>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Loginpage username={username} setUsername={setUsername} room={room} setRoom={setRoom} joinChat={joinChat}/>} />
          <Route path="/message" element={<MessagePage room={room} username={username} setSocket={setSocket}/>}/>
        </Routes>
      </div>
    ):(
    <>
    
    </>)}
    </>
  )
}

export default App
