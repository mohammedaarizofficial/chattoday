import Register from "../components/Register";

interface RegisterPageProps{
    username:string,
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    registerUser:(e: React.FormEvent<HTMLFormElement>)=>void;
    loginError:string;
}

function RegisterPage({
    username,
    setUsername,
    registerUser,
    password,
    setPassword,
    loginError
}:RegisterPageProps){
    return(
        <>
        <Register 
        username={username}
        setUsername={setUsername}
        registerUser={registerUser}
        password={password}
        setPassword={setPassword}
        loginError={loginError}
        />
        </>
    )
}

export default RegisterPage;