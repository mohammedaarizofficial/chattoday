import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import type { Socket } from 'socket.io-client';
import type { RefObject } from 'react';
import  type {DefaultEventsMap}  from "socket.io";


type ChatMessage = {
  room:string,
  username:string,
  message:string,
  time:string
}

interface MessagePageProps{
    username:string,
    room:string,
    availableRooms:string[],
    setMessage:React.Dispatch<React.SetStateAction<string>>,
    typingUser:string|null,
    messages:ChatMessage[],
    bottomRef:RefObject<HTMLDivElement | null>,
    sendMessage:(e: React.FormEvent<HTMLFormElement>)=>void,
    message:string,
    socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
}


function MessagePage({username,room,availableRooms, typingUser, messages,bottomRef,sendMessage,message,setMessage,socket}:MessagePageProps){
    const navigate = useNavigate();

    
    return(
        <>
        <div className="container-fluid vh-100 bg-dark text-light" style={{height:"100%"}}>
            <div className="row">
                <div className="col-2 vh-100 d-flex flex-column vh-100 border-end border-secondary-subtle">
                <div className="nav-header mt-2 text-center">Rooms</div>
                <hr></hr>
                {availableRooms.map((rooms,index)=>(
                    <div key={index} className="nav-body">{rooms}</div>
                ))}
                <div className="mt-auto mb-2 text-center">
                    <Button variant='text' onClick={()=>navigate('/')}>Log Out</Button>
                </div>
                </div>
                <div className='col-10 d-flex flex-column vh-100'>
                <h1 className="bg-dark text-center text-light py-3 m-0">You are in room: {room||"Loading..."}</h1>

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