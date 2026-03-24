import Login from "../components/Login";

interface LoginPageProps{
    username:string,
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    joinChat:(e: React.FormEvent<HTMLFormElement>)=>void;
    loginError:string;
}

function Loginpage({username, password, setPassword,setUsername, joinChat, loginError}:LoginPageProps){
    return(
        <>
        <Login username={username} setUsername={setUsername} password={password} setPassword={setPassword} joinChat={joinChat} loginError={loginError}/>
        </>
    )
}

export default Loginpage;