import Register from "../components/Register";

interface RegisterPageProps{
    availableRooms:string[],
    createSocket:(token:string)=>void,
}

function RegisterPage({availableRooms,createSocket}:RegisterPageProps){
    return(
        <>
        <Register 
        availableRooms={availableRooms}
        createSocket={createSocket}
        />
        </>
    )
}

export default RegisterPage;