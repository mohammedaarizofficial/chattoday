import Login from "../components/Login";

interface LoginPageProps{
    username:string,
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    joinChat:(e: React.FormEvent<HTMLFormElement>)=>void;
}

function Loginpage({username, password, setPassword,setUsername, joinChat}:LoginPageProps){
    return(
        <>
        <Login username={username} setUsername={setUsername} password={password} setPassword={setPassword} joinChat={joinChat}/>
        </>
    )
}

export default Loginpage;