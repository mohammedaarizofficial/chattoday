import { Search, MessageCircle, PlusSquare, LogOut, CircleUserRound } from "lucide-react";
import type { RefObject } from "react";
import type { DefaultEventsMap } from "socket.io";
import type { Socket } from "socket.io-client";

interface SidebarProps{
  setModal:React.Dispatch<React.SetStateAction<boolean>>;
  rooms:string[];
  username:string;
  selectedRoom:string;
  setSelectedRoom:React.Dispatch<React.SetStateAction<string>>;
  onLogout:()=>void;
  socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap>|null>;
}

function SidebarComponent({setModal, rooms, username, selectedRoom, setSelectedRoom, onLogout, socket}:SidebarProps){

  const getChatName = (room:string, username:string)=>{
    if(!room) return "";

    const parts = room.split("_");

    // Private room: show only the other person.
    if(parts.length === 2 && parts.includes(username)){
      return parts.filter(u => u !== username).join(", ") || room;
    }

    // Group/custom room ids with underscores become comma-separated labels.
    if (room.includes("_")) {
      return parts.filter(Boolean).join(", ");
    }
    return room;
  };

  const handleSelectRoom = (room:string)=>{
    setSelectedRoom(room);
    socket.current?.emit("joinRoom", room);
  };

  return (
    <aside className="app-sidebar">
      <div className="brand-row">
        <span className="brand-text">aperture</span>
      </div>

      <button type="button" className="compose-btn" onClick={()=>setModal(true)}>
        <PlusSquare size={18} />
        <span>New message</span>
      </button>

      <div className="search-row">
        <Search size={16} />
        <input aria-label="Search rooms" placeholder="Search..." />
      </div>

      <div className="rooms-list">
        {rooms.length === 0 ? (
          <div className="empty-state">No messages yet</div>
        ) : (
          rooms.map((room)=>{
            const chatName = getChatName(room, username);
            const isActive = selectedRoom === room;
            return (
              <button
                key={room}
                type="button"
                className={`room-item ${isActive ? "active" : ""}`}
                onClick={()=>handleSelectRoom(room)}
              >
                <CircleUserRound size={20} />
                <span>{chatName}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <div className="me-row">
          <MessageCircle size={16} />
          <span>You: {username}</span>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}

export default SidebarComponent;