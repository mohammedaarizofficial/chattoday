import Button from '@mui/material/Button';
import { useState,useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import type { RefObject } from 'react';
import  type {DefaultEventsMap}  from "socket.io";
import { Message,MainContainer,MessageList,ChatContainer,MessageInput,ConversationHeader,Avatar,VoiceCallButton,VideoCallButton,InfoButton} from '@chatscope/chat-ui-kit-react';
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import SidebarComponent from '../components/SidebarComponent';
import AddUser from '../components/AddUser';
import CreateRoomModal from '../components/CreateRoomModal';


type ChatMessage = {
  _id?: string,
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
    setAddUser:React.Dispatch<React.SetStateAction<string[]>>;
    addUser:string[],
    setSelectedRoom:React.Dispatch<React.SetStateAction<string>>
}


function MessagePage({username,selectedRoom,availableRooms, setMessage,typingUser, messages,sendMessage,message,socket,setLogOut,usersList,setAddUser,addUser,setSelectedRoom}:MessagePageProps){
    const [modal, setModal]=useState<boolean>(false);
    const [createRoomModal, setCreateRoomModal]=useState<boolean>(false);
    const LogOut = ()=>{
        setLogOut(true);
    }

    const getChatTitle = (room:string, username:string)=>{
  if(!room) return "Select a conversation";

  const parts = room.split("_");

  if(parts.length === 2 && parts.includes(username)){
    return parts.find(u => u !== username) || room;
  }

  return room;
};

const chatTitle = getChatTitle(selectedRoom, username);
    const typingIndicator = chatTitle;

    useEffect(()=>{
        if(!modal) return;

        socket.current?.emit("getUsers");

    },[modal]);

    const handleCreateRoom = ()=>{
        setCreateRoomModal(true);
        console.log("info button is clicked");
    }

    return(
        <>
        <div className="container-fluid vh-100 bg-dark text-light vw-100 p-0" style={{height:"100%"}}>
            <div className="row g-0">
                <div className="col-2 vh-100 d-flex flex-column vh-100 border-end border-secondary-subtle">
                    <SidebarComponent 
                    setModal={setModal}
                    rooms={availableRooms}
                    username={username}
                    setSelectedRoom={setSelectedRoom}
                    socket={socket}
                    />
                <div className="mt-auto text-center" style={{backgroundColor:"white"}}>
                    <Button className="mb-2" variant='text' onClick={LogOut}>Log Out</Button>
                </div>
                </div>
                <div className='col-10 d-flex flex-column vh-100 '>
                    {typingUser && typingUser !== username && (
                    <div style={{ fontStyle: "italic", color: "gray" }}>
                        {typingIndicator} is typing...
                    </div>
                    )}
                    <main className="flex-grow-1 overflow-auto">
                    {selectedRoom ? (
                    <MainContainer>
                        <ChatContainer>
                        <ConversationHeader>
                            <Avatar
                                name={chatTitle||"User"}
                                src="https://chatscope.io/storybook/react/assets/emily-xzL8sDL2.svg"
                            />
                            <ConversationHeader.Content
                                userName={chatTitle}
                            />
                            <ConversationHeader.Actions>
                                <div className="d-flex align-items-center me-3">
                                    <Avatar name={username} />
                                    <span className="ms-2 small text-muted">You: {username}</span>
                                </div>
                                <VoiceCallButton title="Start voice call" />
                                <VideoCallButton title="Start video call" />
                                <InfoButton title="Show info" onClick={handleCreateRoom}/>
                            </ConversationHeader.Actions>
                        </ConversationHeader>
                        <MessageList >
                            {messages.map((msg,index)=>(
                            <Message
                                key={msg._id ?? `${msg.username}-${msg.time}-${index}`}
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
                    <div className="d-flex justify-content-center align-items-center h-100 text-muted bg-light">
                        <h3 className="text-black">Select a conversation to start chatting</h3>
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
                                username={username}
                                usersList={usersList} 
                                setAddUsers={setAddUser}
                                addUsers={addUser}
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
                    {createRoomModal&&(
                        <CreateRoomModal 
                            setCreateRoomModal={setCreateRoomModal}
                            selectedRoom={selectedRoom}
                            socket={socket}
                        />
                    )}
                    </main>
                </div>
            </div>
        </div>
        </>
    )
}

export default MessagePage;