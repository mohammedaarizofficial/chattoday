import { Link } from "react-router-dom";

interface LoginProps{
    username:string,
    password:string,
    setPassword:React.Dispatch<React.SetStateAction<string>>,
    setUsername:React.Dispatch<React.SetStateAction<string>>,
    registerUser:(e: React.FormEvent<HTMLFormElement>)=>void;
    loginError:string;
}

function Login({
    username,
    setUsername,
    registerUser,
    password,
    setPassword,
    loginError
}:LoginProps){

    return(
        <div className="relative min-h-screen overflow-hidden bg-background text-foreground">

            {/* Background glow gradients */}
            <div
                aria-hidden
                className="
                    auth-shell
                    pointer-events-none
                    absolute
                    left-1/2
                    top-[-220px]
                    h-[500px]
                    -translate-x-1/2
                    rounded-full
                    opacity-30
                    blur-3xl
                    bg-gradient-brand
                "
            />

            <div
                aria-hidden
                className="
                    pointer-events-none
                    absolute
                    bottom-[-180px]
                    right-[-120px]
                    h-[420px]
                    w-[420px]
                    rounded-full
                    opacity-20
                    blur-3xl
                    bg-gradient-story
                "
            />

            {/* Main wrapper */}
            <div className="auth-shell relative flex min-h-screen items-center justify-center px-6">

                {/* Card */}
                <form
                    onSubmit={registerUser}
                    style={{width:"100%"}}
                    className="
                        auth-card
                        w-full
                        max-w-md
                        rounded-3xl
                        bg-card/60
                        p-8
                        shadow-soft
                        backdrop-blur-xl
                    "
                >

                    {/* Brand */}
                    <div className="mb-8 text-center">

                        <h1 className="auth-brand font-display text-6xl font-bold tracking-tight text-gradient-brand">
                            Aperture
                        </h1>

                        <h3 className="auth-subtitle mt-2 text-sm text-muted-foreground">
                            Register
                        </h3>
                    </div>

                    {/* Username */}
                    <div className="mb-3 auth-field">

                        <label
                            htmlFor="username"
                            className="
                                mb-2
                                block
                                text-xs
                                font-medium
                                uppercase
                                tracking-wider
                                text-muted-foreground
                            "
                        >
                            Username
                        </label>

                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e)=>setUsername(e.target.value)}
                            required
                            className="
                                h-12
                                w-full
                                rounded-xl
                                bg-background/50
                                px-4
                                text-sm
                                outline-none
                                transition
                                placeholder:text-muted-foreground/50
                                focus:border-primary/50
                                focus:ring-2
                                focus:ring-primary/30
                            "
                        />
                    </div>

                    {/* Password */}
                    <div className="mb-4 auth-field">

                        <label
                            htmlFor="password"
                            className="
                                mb-2
                                block
                                text-xs
                                font-medium
                                uppercase
                                tracking-wider
                                text-muted-foreground
                            "
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                            required
                            className="
                                h-12
                                w-full
                                rounded-xl
                                bg-background/50
                                px-4
                                text-sm
                                outline-none
                                transition
                                placeholder:text-muted-foreground/50
                                focus:border-primary/50
                                focus:ring-2
                                focus:ring-primary/30
                            "
                        />
                    </div>

                    {/* Error */}
                    {loginError && (
                        <div
                            className="
                                mb-4
                                rounded-xl
                                border
                                border-red-500/20
                                bg-red-500/10
                                px-4
                                py-3
                                text-sm
                                text-red-300
                            "
                            role="alert"
                        >
                            {loginError}
                        </div>
                    )}

                    {/* Login button */}
                    <button
                        type="submit"
                        className="
                            auth-submit
                            h-12
                            w-full
                            rounded-xl
                            bg-gradient-brand
                            text-sm
                            font-semibold
                            text-primary-foreground
                            shadow-glow
                            transition
                            hover:opacity-95
                            active:scale-[0.99]
                        "
                    >
                        Register
                    </button>

                    {/* Divider */}
                    <div
                        className="
                            my-7
                            flex
                            items-center
                            gap-3
                            text-[11px]
                            uppercase
                            tracking-wider
                            text-muted-foreground
                        "
                    >
                        <div className="h-px flex-1 bg-border"/>
                        or
                        <div className="h-px flex-1 bg-border"/>
                    </div>

                    {/* Social buttons */}
                    <div className="space-y-3">

                        <button
                            type="button"
                            className="
                                flex
                                h-12
                                w-full
                                items-center
                                justify-center
                                rounded-lg
                                bg-surface
                                text-sm
                                font-medium
                                transition
                                hover:bg-surface-elevated
                                mb-2
                            "
                        >
                            Continue with Google
                        </button>

                        <button
                            type="button"
                            className="
                                flex
                                h-12
                                w-full
                                items-center
                                justify-center
                                bg-surface
                                text-sm
                                font-medium
                                transition
                                hover:bg-gray-200
                                rounded-lg
                            "
                        >
                            Continue with Apple
                        </button>
                    </div>

                    {/* Footer */}
                    <p className="auth-footer mt-9 text-center text-sm text-muted-foreground" style={{marginTop:"10px"}}>
                        Already registered?{" "}
                        <Link
                            to="/"
                            className="
                                font-medium
                                text-foreground
                                transition
                                hover:text-primary
                            "
                        >
                            Login
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default Login;