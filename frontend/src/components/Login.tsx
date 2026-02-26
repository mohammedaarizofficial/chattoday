import Button from "@mui/material/Button"

interface LoginProps{
    username:string,
    room:string,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    setRoom:React.Dispatch<React.SetStateAction<string>>,
    joinChat:()=>void;
}

function Login({username, room, setUsername, setRoom, joinChat}:LoginProps){

    return(
        <>
        <div className='d-flex justify-content-center align-items-center' style={{maxWidth:"25%"}}>
            <form onSubmit={joinChat}  className="mx-auto my-auto border border-secondary-subtle rounded-2 p-3">
                <img className="mb-4" src="/docs/5.3/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" />
                <h1 className="h3 mb-3 fw-normal text-center text-light">Join Chat</h1>
                <div className="form-floating">
                    <input type="text" className="form-control mb-3 bg-dark text-light" id="floatingInput" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                    <label htmlFor="floatingInput">Username</label>
                </div>
                <div className="form-floating">
                    <input type="text" className="form-control mb-3 bg-dark text-light" id="floatingPassword" placeholder="Room" value={room} onChange={(e)=>setRoom(e.target.value)}/>
                    <label htmlFor="floatingPassword">Room</label>
                </div>
                <Button type="submit" variant="contained" className="mx-auto" fullWidth>Join Chat</Button>
            </form>
        </div>
        </>
    )
}

export default Login;