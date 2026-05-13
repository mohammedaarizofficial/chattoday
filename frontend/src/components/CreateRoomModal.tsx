import type { FormEvent, RefObject } from "react";
import { useState } from "react";
import type { DefaultEventsMap } from "socket.io";
import type { Socket } from "socket.io-client";

interface CreateRoomModalProps{
    setCreateRoomModal:React.Dispatch<React.SetStateAction<boolean>>;
    selectedRoom:string;
    socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
}

function CreateRoomModal({
    setCreateRoomModal,
    selectedRoom,
    socket
}:CreateRoomModalProps){

    const [newRoomId, setNewRoomId] = useState<string>(selectedRoom);
    const [error, setError] = useState<string>("");

    const handleSubmit = (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        if(!socket.current) return;

        const trimmed = newRoomId.trim();

        if (!trimmed) {
            setError("Group name cannot be empty.");
            return;
        }

        socket.current.emit("renameGroupRoom", {
            oldRoom: selectedRoom,
            newRoom: trimmed
        });

        setCreateRoomModal(false);
    };

    return(
        <>
            {/* BACKDROP */}
            <div
                onClick={()=>setCreateRoomModal(false)}
                style={{
                    position:"fixed",
                    inset:0,
                    background:"rgba(0,0,0,0.65)",
                    backdropFilter:"blur(10px)",
                    zIndex:3000
                }}
            />

            {/* MODAL CONTAINER */}
            <div
                style={{
                    position:"fixed",
                    inset:0,
                    zIndex:3001,
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    padding:"24px"
                }}
            >
                {/* CARD */}
                <div
                    className="auth-card"
                    onClick={(e)=>e.stopPropagation()}
                    style={{
                        width:"100%",
                        maxWidth:"520px",
                        padding:"32px",
                        borderRadius:"28px",
                        position:"relative",
                        background:"var(--surface)",
                        border:"1px solid var(--border)",
                        boxShadow:"var(--shadow-soft)"
                    }}
                >

                    {/* HEADER */}
                    <div
                        className="d-flex justify-content-between align-items-start"
                        style={{marginBottom:"24px"}}
                    >
                        <div>
                            <h2
                                className="auth-title"
                                style={{
                                    fontSize:"1.45rem",
                                    marginBottom:"6px"
                                }}
                            >
                                Edit Group
                            </h2>

                            <p className="auth-subtitle mb-0">
                                Rename your group conversation.
                            </p>
                        </div>

                        <button
                            onClick={()=>setCreateRoomModal(false)}
                            style={{
                                width:"38px",
                                height:"38px",
                                borderRadius:"50%",
                                border:"1px solid var(--border)",
                                background:"var(--surface-elevated)",
                                color:"var(--foreground)",
                                cursor:"pointer",
                                fontSize:"1rem"
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    {/* FORM */}
                    <form onSubmit={handleSubmit}>

                        <div
                            className="auth-field"
                            style={{marginBottom:"18px"}}
                        >
                            <label htmlFor="groupName">
                                Group Name
                            </label>

                            <input
                                id="groupName"
                                type="text"
                                value={newRoomId}
                                onChange={(e)=>{
                                    setNewRoomId(e.target.value);

                                    if(error){
                                        setError("");
                                    }
                                }}
                                placeholder="Enter group name"
                            />
                        </div>

                        {error && (
                            <div
                                style={{
                                    marginBottom:"16px",
                                    padding:"12px 14px",
                                    borderRadius:"14px",
                                    background:"rgba(255,80,80,0.08)",
                                    border:"1px solid rgba(255,80,80,0.25)",
                                    color:"#ff7d7d",
                                    fontSize:"0.92rem"
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="auth-submit"
                        >
                            Save Group Name
                        </button>

                        <button
                            type="button"
                            onClick={()=>setCreateRoomModal(false)}
                            style={{
                                width:"100%",
                                marginTop:"12px",
                                padding:"14px",
                                borderRadius:"16px",
                                border:"1px solid var(--border)",
                                background:"transparent",
                                color:"var(--muted-foreground)",
                                fontWeight:"500",
                                cursor:"pointer",
                                transition:"0.2s ease"
                            }}
                        >
                            Cancel
                        </button>

                    </form>
                </div>
            </div>
        </>
    );
}

export default CreateRoomModal;