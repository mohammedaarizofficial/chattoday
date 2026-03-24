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

function AddUser({username,usersList, addUsers, setAddUsers, setModal, socket}:AddUserProps){

    const handleToggleUser = (user:string)=>{
        setAddUsers(prev=>{
            if(prev.includes(user)){
                // remove user
                return prev.filter(u => u !== user);
            } else {
                // add user
                return [...prev, user];
            }
        });
    };

    const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        if(addUsers.length === 0 || !socket.current){
            return;
        }

        console.log("Selected Users:", addUsers);

        socket.current.emit("startGroupChat",{
            users:addUsers
        });

        setModal(false);
        setAddUsers([]); // reset after submit
    };

    return(
        <div className='d-flex justify-content-center align-items-center w-100'>
            <form onSubmit={handleSubmit} className="w-100 border border-secondary-subtle rounded-2 p-3">

                <h1 className="h5 mb-3 text-center">Create Group</h1>

                <div className="dropdown">
                    <button 
                        className="btn btn-secondary dropdown-toggle mb-2 w-100" 
                        type="button" 
                        data-bs-toggle="dropdown"
                    >
                        {addUsers.length > 0 
                          ? `${addUsers.length} selected` 
                          : 'Select Users'}
                    </button>

                    <ul className="dropdown-menu w-100">
                        {usersList.filter(u=>u!==username).map((user,index)=>(
                            <li key={index} className="px-3 py-1">

                                <input
                                    type="checkbox"
                                    id={user}
                                    checked={addUsers.includes(user)}
                                    onChange={()=>handleToggleUser(user)}
                                />

                                <label htmlFor={user} className="ms-2">
                                    {user}
                                </label>

                            </li>
                        ))}
                    </ul>
                </div>

                <Button type="submit" variant="contained" fullWidth>
                    {addUsers.length>0?"Create Group":"Add User"}
                </Button>

            </form>
        </div>
    );
}

export default AddUser;