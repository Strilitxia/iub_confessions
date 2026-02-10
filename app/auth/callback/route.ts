import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    let next = searchParams.get('next') ?? '/'
    
    // Ensure next is a relative URL
    if (!next.startsWith('/')) {
        next = '/'
    }

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            // Server-side email domain validation for @iub.edu.bd
            const email = data.user.email
            if (!email || !email.endsWith('@iub.edu.bd')) {
                // Sign out user if domain doesn't match
                await supabase.auth.signOut()
                return NextResponse.redirect(`${origin}/login?error=invalid_domain`)
            }
            
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'
            
            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // Return to error page on failure
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
