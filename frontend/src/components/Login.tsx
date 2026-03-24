import Button from "@mui/material/Button"
import { Link } from "react-router-dom"

interface LoginProps{
    username:string,
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    joinChat:(e: React.FormEvent<HTMLFormElement>)=>void;
    loginError:string;
}

function Login({username, setUsername, joinChat, password, setPassword, loginError}:LoginProps){

    return(
        <>
        <div className='d-flex justify-content-center align-items-center' style={{maxWidth:"25%"}}>
            <form onSubmit={joinChat}  className="mx-auto my-auto border border-secondary-subtle rounded-2 p-3">
                <img className="mb-4" src="/docs/5.3/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" />
                <h1 className="h3 mb-3 fw-normal text-center text-light">Login</h1>
                <div className="form-floating">
                    <input type="text" className="form-control mb-3 bg-dark text-light" id="floatingInput" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)}/>
                    <label htmlFor="floatingInput">Username</label>
                </div>
                <div className="form-floating">
                    <input type="password" className="form-control mb-3 bg-dark text-light" id="floatingPassword" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}/>
                    <label htmlFor="floatingPassword">Password</label>
                </div>
                {loginError && (
                    <div className="alert alert-danger py-2" role="alert">
                        {loginError}
                    </div>
                )}
                <Link to="/register" className="text-decoration-none mb-2">
                Register
                </Link>
                <Button type="submit" variant="contained" className="mx-auto" fullWidth>Login</Button>
            </form>
        </div>
        </>
    )
}

export default Login;