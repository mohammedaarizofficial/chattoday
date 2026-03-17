import { Sidebar, Search, ConversationList, Conversation, Avatar,AddUserButton } from "@chatscope/chat-ui-kit-react"
import type { RefObject } from "react";
import type { DefaultEventsMap } from "socket.io";
import type { Socket } from "socket.io-client";

interface SidebarProps{
  setModal:React.Dispatch<React.SetStateAction<boolean>>;
  rooms:string[];
  username:string;
  setRoom:(room:string)=>void;
  setSelectedRoom:React.Dispatch<React.SetStateAction<string>>
  socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap>|null>
}

function SidebarComponent({setModal, rooms, username, setRoom, setSelectedRoom,socket}:SidebarProps){

  const getOtherUser = (room:string, username:string)=>{
    if(!room) return room;
    if(!username) return room;
    if(!room.includes("_")) return room;
    const parts = room.split("_");
    // Only treat it as a private chat if the current user is actually part of it
    if(!parts.includes(username)) return null;
    return parts.find(user => user !== username) || room;
  }

  const handleSelectRoom = (room:string)=>{
    setSelectedRoom(room);
    setRoom(room);
    socket.current?.emit("joinRoom", room);
  }

  return(
    <Sidebar position="left">

      <Search className="mt-2 mx-1" placeholder="Search..." />

      <div className="d-flex justify-content-end">
        <AddUserButton className="hover-scale" onClick={()=>setModal(true)}/>
      </div>

      <ConversationList>
        {rooms.map((room,index)=>{
          const otherUser = getOtherUser(room, username);
          if(otherUser === null) return null;

          return (
            <Conversation
              key={index}
              name={otherUser}
              onClick={()=>handleSelectRoom(room)}
            >
              <Avatar name={otherUser} />
            </Conversation>
          );
        })}
      </ConversationList>

    </Sidebar>
  )
}

export default SidebarComponent;