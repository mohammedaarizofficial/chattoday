import Login from "../components/Login";

interface LoginPageProps{
    username:string,
    room:string,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    setRoom:React.Dispatch<React.SetStateAction<string>>,
    joinChat:()=>void;
}

function Loginpage({username, room, setUsername, setRoom, joinChat}:LoginPageProps){
    return(
        <>
        <Login username={username} setUsername={setUsername} room={room} setRoom={setRoom} joinChat={joinChat}/>
        </>
    )
}

export default Loginpage;