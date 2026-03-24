import type { FormEvent, RefObject } from "react";
import { useState } from "react";
import type { DefaultEventsMap } from "socket.io";
import type { Socket } from "socket.io-client";

interface CreateRoomModalProps{
    setCreateRoomModal:React.Dispatch<React.SetStateAction<boolean>>;
    selectedRoom:string;
    socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>;
}

function CreateRoomModal({setCreateRoomModal, selectedRoom, socket}:CreateRoomModalProps){
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
        <div
            className="modal modal-sheet d-block bg-body-secondary p-4 py-md-5"
            tabIndex={-1}
            role="dialog"
        >
            <div className="modal-dialog">
                <div className="modal-content rounded-4 shadow">
                    <div className="modal-header p-4 pb-3 border-bottom-0">
                        <h1 className="fw-bold mb-0 fs-5">Manage Group Members</h1>
                        <button type="button" className="btn-close" aria-label="Close" onClick={()=>setCreateRoomModal(false)}></button>
                    </div>
                    <div className="modal-body p-4 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3 text-muted small">
                                Change the group name. This will become the new room ID for all members.
                            </div>

                            <div className="form-floating mb-3">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="groupName"
                                    value={newRoomId}
                                    onChange={(e)=>setNewRoomId(e.target.value)}
                                    placeholder="Enter group name"
                                />
                                <label htmlFor="groupName">Group Name</label>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2" role="alert">
                                    {error}
                                </div>
                            )}

                            <button className="w-100 btn btn-primary" type="submit">
                                Save Group Name
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        </>
    )
}

export default CreateRoomModal;