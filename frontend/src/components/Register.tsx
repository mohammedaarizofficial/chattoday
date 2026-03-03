import { Button } from "@mui/material";

function Register(){
    return(
        <>
        <div className='d-flex justify-content-center align-items-center' style={{maxWidth:"25%"}}>
            <form className="mx-auto my-auto border border-secondary-subtle rounded-2 p-3">
                <img className="mb-4" src="/docs/5.3/assets/brand/bootstrap-logo.svg" alt="" width="72" height="57" />
                <h1 className="h3 mb-3 fw-normal text-center text-light">Register</h1>
                <div className="form-floating">
                    <input type="text" className="form-control mb-3 bg-dark text-light" id="floatingInput" placeholder="Username"/>
                    <label htmlFor="floatingInput">Username</label>
                </div>
                <div className="form-floating">
                    <input type="text" className="form-control mb-3 bg-dark text-light" id="floatingPassword" placeholder="Password"/>
                    <label htmlFor="floatingPassword">Password</label>
                </div>
                <Button type="submit" variant="contained" className="mx-auto" fullWidth>Register</Button>
            </form>
        </div>
        </>
    )
}
export default Register;