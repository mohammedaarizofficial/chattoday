import { Button } from "@mui/material"
import type { RefObject } from "react"
import { Socket } from "socket.io-client"
import type { DefaultEventsMap } from "socket.io"

interface AddUserProps{
    usersList:string[],
    setAddUser:React.Dispatch<React.SetStateAction<string>>,
    addUser:string,
    setModal:React.Dispatch<React.SetStateAction<boolean>>
    socket:RefObject<Socket<DefaultEventsMap, DefaultEventsMap> | null>,
}

function AddUser({usersList,setAddUser,addUser,setModal,socket}:AddUserProps){

    const handleSubmit=(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault();

        if(!addUser||!socket.current){
            return;
        }
        console.log("Selected User:", addUser);

        socket.current.emit("startPrivateChat",{
            to:addUser
        })

        setModal(false);
    }
    return(
        <div className='d-flex justify-content-center align-items-center w-100'>
            <form  onSubmit={handleSubmit} className="w-100 my-auto border border-secondary-subtle rounded-2 p-3">
                <img className="mb-4" src="/docs/5.3/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" />
                <h1 className="h3 mb-3 fw-normal text-center text-dark">New message</h1>
                <div className="dropdown">
                    <button className="btn btn-secondary dropdown-toggle mb-2" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{width:"100%"}}>
                        {addUser||'Select User'}
                    </button>
                    <ul className="dropdown-menu mb-2">
                        {usersList.map((user,index)=>(
                        <li key={index}>
                            <button type="button" className="dropdown-item" 
                        onClick={()=>setAddUser(user)}>{user}</button>
                        </li>
                        ))}
                    </ul>
                </div>
                <Button type="submit" variant="contained" className="mx-auto" fullWidth>Add user</Button>
            </form>
        </div>
    )
}

export default AddUser;