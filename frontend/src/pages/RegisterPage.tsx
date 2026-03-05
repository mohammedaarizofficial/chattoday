import Register from "../components/Register";

interface RegisterPageProps{
    availableRooms:string[]
}

function RegisterPage({availableRooms}:RegisterPageProps){
    return(
        <>
        <Register availableRooms={availableRooms}/>
        </>
    )
}

export default RegisterPage;