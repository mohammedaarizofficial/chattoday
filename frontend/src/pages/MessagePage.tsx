import Button from '@mui/material/Button';
import { useState,useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import type { RefObject } from 'react';
import  type {DefaultEventsMap}  from "socket.io";
import { Message,MainContainer,MessageList,ChatContainer,MessageInput} from '@chatscope/chat-ui-kit-react';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import SidebarComponent from '../components/SidebarComponent';
import AddUser from '../components/AddUser';


type ChatMessage = {
  room:string,
  username:string,
  message:string,
  time:string
}
interface MessagePageProps{
    username:string,
    selectedRoom:string,
    availableRooms:string[],
    setMessage:React.Dispatch<React.SetStateAction<string>>,
    typingUser:string|null,
    messages:ChatMessage[],
    sendMessage:(text:string)=>void,
    message:string,
    socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
    setLogOut:React.Dispatch<React.SetStateAction<boolean>>;
    usersList:string[];
    setAddUser:React.Dispatch<React.SetStateAction<string>>;
    addUser:string,
    setRoom:React.Dispatch<React.SetStateAction<string>>;
    setSelectedRoom:React.Dispatch<React.SetStateAction<string>>
}


function MessagePage({username,selectedRoom,availableRooms, setMessage,typingUser, messages,sendMessage,message,socket,setLogOut,usersList,setAddUser,addUser,setRoom,setSelectedRoom}:MessagePageProps){
    const [modal, setModal]=useState<boolean>(false);
    const LogOut = ()=>{
        setLogOut(true);
    }

    const typingIndicator = typingUser+" is typing...";

    const getOtherUser = (room:string, username:string)=>{
        if(!room) return room;
        if(!username) return room;
        if(!room.includes("_")) return room;
        const parts = room.split("_");
        if(!parts.includes(username)) return room;
        return parts.find(user => user !== username) || room;
    }

    const chatTitle = selectedRoom ? (getOtherUser(selectedRoom, username) || selectedRoom) : "Select a conversation";

    useEffect(()=>{
        if(!modal) return;

        socket.current?.emit("getUsers");

    },[modal]);

    return(
        <>
        <div className="container-fluid vh-100 bg-dark text-light" style={{height:"100%"}}>
            <div className="row">
                <div className="col-2 vh-100 d-flex flex-column vh-100 border-end border-secondary-subtle">
                    <SidebarComponent 
                    setModal={setModal}
                    rooms={availableRooms}
                    setRoom={setRoom}
                    username={username}
                    setSelectedRoom={setSelectedRoom}
                    socket={socket}
                    />
                <div className="mt-auto mb-2 text-center">
                    <Button variant='text' onClick={LogOut}>Log Out</Button>
                </div>
                </div>
                <div className='col-10 d-flex flex-column vh-100'>
                <h1 className="bg-dark text-center text-light py-3 m-0">You are in room: {chatTitle}</h1>

                    {typingUser && typingUser !== username && (
                    <div style={{ fontStyle: "italic", color: "gray" }}>
                        {typingIndicator} is typing...
                    </div>
                    )}
                    <main className="flex-grow-1 overflow-auto px-3">
                    {selectedRoom ? (
                    <MainContainer>
                        <ChatContainer>
                        <MessageList>
                            {messages.map((msg,index)=>(
                            <Message
                                key={index}
                                model={{
                                message: msg.message,
                                sentTime: msg.time,
                                sender: msg.username,
                                direction: msg.username === username ? "outgoing" : "incoming",
                                position: "single"
                                }}
                            />
                            ))}
                        </MessageList>
                        <MessageInput
                            value={message}
                            onChange={(val)=>setMessage(val)}
                            onSend={(text)=>{
                                // chatscope sometimes passes the string directly; keep it simple
                                sendMessage(text);
                            }}
                        />
                        </ChatContainer>
                    </MainContainer>
                    ) : (
                    <div className="d-flex justify-content-center align-items-center h-100 text-muted">
                        <h3>Select a conversation to start chatting</h3>
                    </div>
                    )}
                    {modal && (<>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal show d-block" tabIndex={-1}>
                            <div className="modal-dialog">
                            <div className="modal-content">

                                <div className="modal-header">
                                <h5 className="modal-title">New message</h5>
                                <button
                                    className="btn-close"
                                    onClick={() => setModal(false)}
                                />
                                </div>

                                <div className="modal-body">
                                <AddUser 
                                usersList={usersList} 
                                setAddUser={setAddUser}
                                addUser={addUser}
                                setModal={setModal}
                                socket={socket}
                                />
                                </div>

                                <div className="modal-footer">
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setModal(false)}
                                >
                                    Close
                                </button>
                                </div>

                            </div>
                            </div>
                        </div>
                    </>
                    )}
                    </main>
                </div>
            </div>
        </div>
        </>
    )
}

export default MessagePage;