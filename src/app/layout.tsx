import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ToastProvider } from '@/components/ui/Toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CreatePostModal from '@/components/post/CreatePostModal'

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const playfair = Playfair_Display({
    subsets: ['latin'],
    variable: '--font-playfair',
})

export const metadata: Metadata = {
    title: 'IUB Confessions | Share Your Heart',
    description: 'Anonymous confession platform for IUB students. Share your feelings, stories, and secrets with the community.',
    keywords: ['IUB', 'confessions', 'anonymous', 'university', 'Bangladesh'],
    authors: [{ name: 'IUB Community' }],
    openGraph: {
        title: 'IUB Confessions | Share Your Heart',
        description: 'Anonymous confession platform for IUB students.',
        type: 'website',
        locale: 'en_US',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
            <head>
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#E11D48" />
            </head>
            <body className="font-body antialiased">
                <AuthProvider>
                    <ToastProvider>
                        <div className="min-h-screen flex flex-col bg-cream">
                            <Header />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Footer />
                            <CreatePostModal />
                        </div>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    )
}
