import Register from "../components/Register";

interface RegisterPageProps{
    username:string,
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    joinChat:(e: React.FormEvent<HTMLFormElement>)=>void;
    loginError:string;
}

function RegisterPage({
    username,
    setUsername,
    joinChat,
    password,
    setPassword,
    loginError
}:RegisterPageProps){
    return(
        <>
        <Register 
        username={username}
        setUsername={setUsername}
        joinChat={joinChat}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        />
        </>
    )
}

export default RegisterPage;