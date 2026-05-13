import { useState,useEffect } from 'react';
import type { Socket } from 'socket.io-client';
import type { RefObject } from 'react';
import  type {DefaultEventsMap}  from "socket.io";
import AddUser from '../components/AddUser';
import CreateRoomModal from '../components/CreateRoomModal';
import { Search, Phone, Video, Info, Smile, Send, Edit, MessageSquare, LogOut as LogOutIcon } from "lucide-react";


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
    const handleLogout = ()=>{
        setLogOut(true);
    };

    const getChatTitle = (room:string, username:string)=>{
        if(!room) return "Select a conversation";
        const parts = room.split("_").filter(Boolean);
        if(parts.length === 2 && parts.includes(username)){
            return parts.filter(u => u !== username).join(", ") || room;
        }
        if (room.includes("_")) return parts.join(", ");
        return room;
    };

    useEffect(() => {
        if (selectedRoom) return;
        if (!availableRooms.length) return;
        const firstRoom = availableRooms[0];
        setSelectedRoom(firstRoom);
        socket.current?.emit("joinRoom", firstRoom);
    }, [availableRooms, selectedRoom, setSelectedRoom, socket]);

    useEffect(()=>{
        if(!modal) return;
        socket.current?.emit("getUsers");
    },[modal, socket]);

    const handleCreateRoom = ()=>{
        setCreateRoomModal(true);
    };

    const selectedTitle = getChatTitle(selectedRoom, username);
    const selectedInitials = selectedTitle
        .split(",")
        .map((s) => s.trim().charAt(0))
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase() || "CH";

    return(
        <>
        <div className="messages-page-shell">
            <div className="messages-grid">
                <aside className="threads-panel">
                    <div className="threads-header">
                        <h1>Messages</h1>
                        <button type="button" onClick={() => setModal(true)} aria-label="New message">
                            <Edit size={18} />
                        </button>
                    </div>
                    <div className="threads-search">
                        <Search size={16} />
                        <input placeholder="Search" aria-label="Search conversations" />
                    </div>
                    <div className="threads-list">
                        {availableRooms.length === 0 ? (
                            <div className="threads-empty">No conversations found</div>
                        ) : (
                            availableRooms.map((room) => {
                                const label = getChatTitle(room, username);
                                const isActive = room === selectedRoom;
                                return (
                                    <button
                                        key={room}
                                        type="button"
                                        className={`thread-item ${isActive ? "active" : ""}`}
                                        onClick={() => {
                                            setSelectedRoom(room);
                                            socket.current?.emit("joinRoom", room);
                                        }}
                                    >
                                        <div className="thread-avatar">{label.charAt(0).toUpperCase()}</div>
                                        <div className="thread-content">
                                            <div className="thread-name">{label}</div>
                                            <div className="thread-preview">{isActive ? "Open conversation" : "Tap to open chat"}</div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                    <button type="button" className="logout-floating" onClick={handleLogout}>
                        <LogOutIcon size={16} />
                        <span>Log out</span>
                    </button>
                </aside>

                <section className="conversation-panel">
                    {selectedRoom ? (
                        <>
                            <header className="conversation-header">
                                <div className="conversation-head-left">
                                    <div className="conversation-avatar">{selectedInitials}</div>
                                    <div>
                                        <div className="conversation-name">{selectedTitle}</div>
                                        <div className="conversation-status">
                                            {typingUser && typingUser !== username ? `${selectedTitle} is typing...` : "Active now"}
                                        </div>
                                    </div>
                                </div>
                                <div className="conversation-actions">
                                    <button type="button" aria-label="Call"><Phone size={18} /></button>
                                    <button type="button" aria-label="Video"><Video size={18} /></button>
                                    <button type="button" aria-label="Info" onClick={handleCreateRoom}><Info size={18} /></button>
                                </div>
                            </header>

                            <div className="message-list-modern">
                                {messages.length === 0 ? (
                                    <div className="empty-chat">
                                        <MessageSquare size={42} />
                                        <h3>No messages yet</h3>
                                        <p>Start the conversation by sending a message.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={msg._id ?? `${msg.username}-${msg.time}-${index}`}
                                            className={`bubble-row ${msg.username === username ? "mine" : "theirs"}`}
                                        >
                                            <div className={`bubble ${msg.username === username ? "bubble-mine" : "bubble-theirs"}`}>
                                                {msg.message}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!message.trim()) return;
                                    sendMessage(message);
                                }}
                                className="composer-modern"
                            >
                                <div className="composer-box">
                                    <Smile size={18} className="composer-icon" />
                                    <input
                                        value={message}
                                        onChange={(e)=>setMessage(e.target.value)}
                                        placeholder={`Message ${selectedTitle}...`}
                                        aria-label="Type a message"
                                    />
                                    <button type="submit" disabled={!message.trim()} aria-label="Send">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="empty-chat">
                            <MessageSquare size={42} />
                            <h3>Select a conversation to start chatting</h3>
                            <p>Your chats will appear on the left.</p>
                        </div>
                    )}
                </section>
            </div>
            {modal && (
<>
    {/* BACKDROP */}
    <div
        onClick={() => setModal(false)}
        style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(10px)",
            zIndex: 2000
        }}
    />

    {/* MODAL WRAPPER */}
    <div
        style={{
            position: "fixed",
            inset: 0,
            zIndex: 2001,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "24px"
        }}
    >
        {/* MODAL CARD */}
        <div
            className="auth-card"
            onClick={(e)=>e.stopPropagation()}
            style={{
                width: "100%",
                maxWidth: "560px",
                maxHeight: "75vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                borderRadius: "28px",
                padding: "28px",
                paddingBottom:0,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)"
            }}
        >

            {/* HEADER */}
            <div
                className="d-flex justify-content-between align-items-start"
                style={{
                    flexShrink: 0,
                    marginBottom: "18px"
                }}
            >
                <div>
                    <h2
                        className="auth-title"
                        style={{
                            fontSize: "1.5rem",
                            marginBottom: "6px"
                        }}
                    >
                        Create Group
                    </h2>

                    <p className="auth-subtitle mb-0">
                        Select people to start chatting.
                    </p>
                </div>

                <button
                    onClick={() => setModal(false)}
                    style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        border: "1px solid var(--border)",
                        background: "var(--surface-elevated)",
                        color: "var(--foreground)",
                        cursor: "pointer",
                        fontSize: "1rem",
                        flexShrink: 0
                    }}
                >
                    ✕
                </button>
            </div>

            {/* BODY */}
            <div
                style={{
                    flex: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                <AddUser 
                    username={username}
                    usersList={usersList} 
                    setAddUsers={setAddUser}
                    addUsers={addUser}
                    setModal={setModal}
                    socket={socket}
                />
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
        </div>
        </>
    );
}

export default MessagePage;