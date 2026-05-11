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
        <div className="auth-shell">
            <form onSubmit={joinChat} className="auth-card">
                <p className="auth-brand">aperture</p>
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Log in to continue your conversations.</p>

                <div className="auth-field">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e)=>setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                    />
                </div>
                {loginError && (
                    <div className="auth-error" role="alert">
                        {loginError}
                    </div>
                )}
                <button type="submit" className="auth-submit">Log in</button>
                <p className="auth-footer">
                    Don&apos;t have an account?{" "}
                    <Link to="/register">Register</Link>
                </p>
            </form>
        </div>
        </>
    )
}

export default Login;