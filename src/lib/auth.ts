import {pb} from '@src/data/pocketbase'

export const isValidEmail = (email: string) => {
    if(typeof email !== 'string') return false
    if(email.length > 255) return false
    const regex = /^.+@.+$/
    return regex.test(email)
}

export const isValidPassword = (password: string) => {
    if(typeof password !== 'string') return false
    if(password.length > 255) return false
    if(password.length < 8) return false
    return true
}

export function isValidData(
    email: string,
    password: string
) {
    if(!isValidEmail(email)){
        return false
    }
    if(!isValidPassword(password)){
        return false
    }

    return true
}

export async function createUser(email: string, password: string) {
    return await pb.collection('users').create({
        email: email,
        password: password,
        passwordConfirm: password,
        emailVisibility: true,
    })
}

export async function getUserUsername(request: Request) {
    pb.authStore.loadFromCookie(
        request.headers.get("Cookie") || "",
        "pb_auth",
    )
    return pb.authStore.model?.username
}

export async function loginUser(email: string, password: string) {
    return await pb.collection('users').authWithPassword(email,password)
}

export async function isLoggedIn(request: Request) {
    if(!request.headers.get('Cookie')) {
        return false
    }

    pb.authStore.loadFromCookie(
        request.headers.get("Cookie") || "", "pb_auth"
    )

    try{
        // get an up-to-date auth store state by verifying and refreshing the loaded auth model(if any)
        if(pb.authStore.isValid && (await pb.collection("users").authRefresh())){
            return true
        }
    } catch(_) {
        pb.authStore.clear()
    }

    return false
}

export function setCookieAndRedirectToDashboard() {
    return new Response(null, {
        status: 301,
        headers: {
            Location: '/app/dashboard',
            // set secure to false on localhost for Safari compatibility
            'Set-Cookie': pb.authStore.exportToCookie({
                secure: import.meta.env.DEV?false:true,
            }),
        },
    })
}