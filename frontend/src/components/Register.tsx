import { Button } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
interface RegisterProps{
    availableRooms:string[],
    createSocket:(token:string)=>void
}

function Register({createSocket}:RegisterProps){
    const [username, setUsername]=useState<string |null>('');
    const [password, setPassword]=useState<string|null>('');

    const navigate = useNavigate()

    const register = async(e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        try{
            const data = await fetch("http://localhost:5432/users",{
                method:"POST",
                headers:{'Content-Type':"application/json"},
                body:JSON.stringify({
                    username:username,
                    password:password
                })
            })
            const newData = await data.json();
            console.log(newData);
            localStorage.setItem('token',newData.token);
            createSocket(newData.token)
            
            navigate('/message');
            setUsername('')
            setPassword('');
        }catch(err){
            console.log(err);
        }
    }

    return(
        <>
        <div className='d-flex justify-content-center align-items-center' style={{maxWidth:"25%"}}>
            <form onSubmit={register} className="mx-auto my-auto border border-secondary-subtle rounded-2 p-3">
                <img className="mb-4" src="/docs/5.3/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" />
                <h1 className="h3 mb-3 fw-normal text-center text-light">Register</h1>
                <div className="form-floating">
                    <input type="text" className="form-control mb-3 bg-dark text-light" id="floatingInput" placeholder="Username"
                    onChange={(e)=>setUsername(e.target.value)}
                    required/>
                    <label htmlFor="floatingInput">Username</label>
                </div>
                <div className="form-floating">
                    <input type="password" className="form-control mb-3 bg-dark text-light" id="floatingPassword" placeholder="Password"
                    onChange={(e)=>setPassword(e.target.value)}
                    required/>
                    <label htmlFor="floatingPassword">Password</label>
                </div>
                <Button type="submit" variant="contained" className="mx-auto" fullWidth>Register</Button>
            </form>
        </div>
        </>
    )
}
export default Register;