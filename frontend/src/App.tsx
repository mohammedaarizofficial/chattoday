import './App.css'
import { useEffect } from 'react'
import {io} from 'socket.io-client';

function App() {

  useEffect(()=>{
    const socket = io('http://localhost:5432');

    socket.on('connect', ()=>{
      console.log('Connected to the server', socket.id);
      socket.emit("hello", "this is the frontend");
    })

    socket.on('disconnect', ()=>{
      console.log('Disconnected from the server', socket.id);
    })

    socket.on("connect_error", (err) => {
      console.log("❌ Connection error:", err.message)
    })

    socket.on('reply', (data)=>{
      console.log("Received from server:", data);
    })

    return ()=>{
      socket.disconnect();
    }
  },[])

  return (
    <>
    <div>
      Socket Test
    </div>
    </>
  )
}

export default App
