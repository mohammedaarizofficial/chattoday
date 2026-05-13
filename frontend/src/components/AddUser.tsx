import { Button } from "@mui/material";
import type { RefObject } from "react";
import { Socket } from "socket.io-client";
import type { DefaultEventsMap } from "socket.io";

interface AddUserProps{
    username:string,
    usersList:string[],
    addUsers:string[],
    setAddUsers:React.Dispatch<React.SetStateAction<string[]>>,
    setModal:React.Dispatch<React.SetStateAction<boolean>>,
    socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
}

function AddUser({
    username,
    usersList,
    addUsers,
    setAddUsers,
    setModal,
    socket
}:AddUserProps){

    const handleToggleUser = (user:string)=>{
        setAddUsers(prev=>{
            if(prev.includes(user)){
                return prev.filter(u => u !== user);
            }

            return [...prev, user];
        });
    };

    const handleSubmit = (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        if(addUsers.length === 0 || !socket.current){
            return;
        }

        socket.current.emit("startGroupChat",{
            users:addUsers
        });

        setModal(false);
        setAddUsers([]);
    };

    return(
        <div 
    className="p-0 bg-transparent"
    style={{
        width:"100%",
        height:"100%",
        overflow:"hidden",
        display:"flex",
        flexDirection:"column"
    }}
>
            <form
                onSubmit={handleSubmit}
                style={{
                    width:"100%",
                    maxWidth:"100%",
                    padding:"24px"
                }}
            >

                <div
                    className="
                    rounded-xl
                    p-4
                    mb-4
                    "
                    style={{
                        maxHeight:"280px",
                        overflowY:"auto",
                        gap:"10px",
                        borderWidth:"1px",
                        borderStyle:"solid",
                        borderColor:"var(--border)"
                    }}
                >
                    {usersList
                        .filter(user => user !== username)
                        .map((user,index)=>{

                        const selected = addUsers.includes(user);

                        return(
                            <label
                                key={index}
                                htmlFor={user}
                                className="d-flex align-items-center justify-content-between mb-2"
                                style={{
                                    padding:"10px 14px",
                                    border:"1px solid var(--border)",
                                    borderRadius:"14px",
                                    background:selected
                                        ? "color-mix(in oklab, var(--primary) 18%, var(--surface-elevated))"
                                        : "var(--surface-elevated)",
                                    cursor:"pointer",
                                    transition:"0.2s ease"
                                }}
                            >
                                <div className="d-flex align-items-center gap-3">

                                    <div
                                        style={{
                                            width:"40px",
                                            height:"40px",
                                            borderRadius:"50%",
                                            display:"grid",
                                            placeItems:"center",
                                            fontWeight:"700",
                                            fontSize:"0.85rem",
                                            background:"var(--gradient-brand)",
                                            color:"#1b1b1b",
                                            textTransform:"uppercase"
                                        }}
                                    >
                                        {user.charAt(0)}
                                    </div>

                                    <div>
                                        <div
                                            style={{
                                                fontWeight:"600",
                                                color:"var(--foreground)"
                                            }}
                                        >
                                            {user}
                                        </div>

                                        <div
                                            style={{
                                                fontSize:"0.78rem",
                                                color:"var(--muted-foreground)"
                                            }}
                                        >
                                            @{user.toLowerCase()}
                                        </div>
                                    </div>
                                </div>

                                <input
                                    type="checkbox"
                                    id={user}
                                    checked={selected}
                                    onChange={()=>handleToggleUser(user)}
                                    style={{
                                        width:"18px",
                                        height:"18px",
                                        accentColor:"#f4a524",
                                        cursor:"pointer"
                                    }}
                                />
                            </label>
                        );
                    })}
                </div>

                {addUsers.length > 0 && (
                    <div
                        style={{
                            marginTop:"14px",
                            marginBottom:"14px",
                            display:"flex",
                            flexWrap:"wrap",
                            gap:"8px"
                        }}
                    >
                        {addUsers.map((user,index)=>(
                            <div
                                key={index}
                                style={{
                                    padding:"6px 12px",
                                    borderRadius:"999px",
                                    background:"color-mix(in oklab, var(--primary) 18%, var(--surface))",
                                    border:"1px solid var(--border)",
                                    fontSize:"0.82rem"
                                }}
                            >
                                {user}
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="submit"
                    className="auth-submit"
                    disabled={addUsers.length === 0}
                    style={{
                        opacity:addUsers.length === 0 ? 0.5 : 1,
                        cursor:addUsers.length === 0 ? "not-allowed" : "pointer"
                    }}
                >
                    {addUsers.length > 0
                        ? `Create Group (${addUsers.length})`
                        : "Select Users"}
                </button>

                <Button
                    type="button"
                    onClick={()=>setModal(false)}
                    fullWidth
                    sx={{
                        marginTop:"12px",
                        color:"var(--muted-foreground)"
                    }}
                >
                    Cancel
                </Button>
            </form>
        </div>
    );
}

export default AddUser;