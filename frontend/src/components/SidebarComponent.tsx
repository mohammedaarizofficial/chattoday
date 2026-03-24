import { Sidebar, Search, ConversationList, Conversation, Avatar,AddUserButton } from "@chatscope/chat-ui-kit-react"
import type { RefObject } from "react";
import type { DefaultEventsMap } from "socket.io";
import type { Socket } from "socket.io-client";

interface SidebarProps{
  setModal:React.Dispatch<React.SetStateAction<boolean>>;
  rooms:string[];
  username:string;
  setSelectedRoom:React.Dispatch<React.SetStateAction<string>>
  socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap>|null>
}

function SidebarComponent({setModal, rooms, username, setSelectedRoom, socket}:SidebarProps){

  const getChatName = (room:string, username:string)=>{
    if(!room) return "";

    const parts = room.split("_");

    if(parts.length === 2 && parts.includes(username)){
      return parts.find(u => u !== username) || room;
    }

    return room;
  };

  const handleSelectRoom = (room:string)=>{
    setSelectedRoom(room);
    socket.current?.emit("joinRoom", room);
  };

  return(
    <Sidebar position="left">

      <Search className="mt-2 mx-1" placeholder="Search..." />

      <div className="d-flex justify-content-end">
        <AddUserButton onClick={()=>setModal(true)}/>
      </div>

      <ConversationList>
        {rooms.length === 0 ? (
          <div className="text-center">No Messages yet...</div>
        ) : (
          rooms.map((room)=>{

            const chatName = getChatName(room, username);

            return (
              <Conversation
                key={room}
                name={chatName}
                onClick={()=>handleSelectRoom(room)}
              >
                <Avatar name={chatName || "User"} />
              </Conversation>
            );
          })
        )}
      </ConversationList>

    </Sidebar>
  );
}

export default SidebarComponent;