// 'use client'

// import { motion } from 'framer-motion'
// import { Heart, Sparkles } from 'lucide-react'
// import { useRouter } from 'next/navigation'
// import ConfessionFeed from '@/components/feed/ConfessionFeed'
// import { useAuth } from '@/components/auth/AuthProvider'

// export default function HomePage() {

//     const { user } = useAuth()
//     const router = useRouter()

//     const handleConfessClick = () => {
//         if (user) {
//             // Trigger create modal for logged-in users
//             const event = new CustomEvent('openCreateModal')
//             window.dispatchEvent(event)
//         } else {
//             // Redirect to login for unregistered users
//             router.push('/login')
//         }
//     }

//     return (
//         <div className="relative">
//             {/* Hero Section - Only show for unregistered users */}
//             <div className="absolute inset-0 overflow-hidden pointer-events-none">
//                 <motion.div
//                     className="absolute top-10 left-10 text-rose-light/30"
//                     animate={{
//                         y: [0, -10, 0],
//                         rotate: [0, 10, 0],
//                     }}
//                     transition={{ duration: 5, repeat: Infinity }}
//                 >
//                     <Heart className="w-16 h-16 fill-current" />
//                 </motion.div>
//                 <motion.div
//                     className="absolute top-20 right-20 text-rose-light/20"
//                     animate={{
//                         y: [0, 10, 0],
//                         rotate: [0, -10, 0],
//                     }}
//                     transition={{ duration: 6, repeat: Infinity, delay: 1 }}
//                 >
//                     <Heart className="w-24 h-24 fill-current" />
//                 </motion.div>
//                 <motion.div
//                     className="absolute bottom-10 right-10 text-rose-light/25"
//                     animate={{
//                         y: [0, -15, 0],
//                         rotate: [0, 15, 0],
//                     }}
//                     transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
//                 >
//                     <Sparkles className="w-12 h-12" />
//                 </motion.div>
//             </div>
//             {!user && (
//                 <section className="relative overflow-hidden bg-gradient-to-b from-rose-light/20 to-transparent  py-10">
//                     {/* Hero Content */}
//                     <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
//                         <motion.div
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             transition={{ duration: 0.6 }}
//                         >


//                             <h1 className="font-heading text-4xl lg:text-6xl font-bold text-text-primary md:mb-4 flex items-center md:flex-row flex-col gap-3 justify-center">
//                                 Share Your True
//                                 <div className='flex item-center gap-2'>
//                                     <span className="text-rose-primary">Feelings</span>
//                                     <motion.div
//                                         animate={{ scale: [1, 1.05, 1] }}
//                                         transition={{ duration: 2, repeat: Infinity }}
//                                         className="inline-block mb-2"
//                                     >
//                                         <Heart className="w-16 h-16 text-rose-primary -mt-3 fill-rose-primary mx-auto" />
//                                     </motion.div>
//                                 </div>
//                             </h1>

//                             <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-5">
//                                 Anonymous confessions from the IUB community.
//                                 Express your feelings, share your stories, and connect with others.
//                             </p>

//                             <motion.button
//                                 onClick={() => router.push('/login')}
//                                 className="bg-rose-primary text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-rose-primary/30 flex items-center gap-2 mx-auto mb-5"
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                             >
//                                 <Heart className="w-5 h-5 fill-current" />
//                                 Confess Your Feelings
//                             </motion.button>

//                             <motion.div
//                                 initial={{ opacity: 0 }}
//                                 animate={{ opacity: 1 }}
//                                 transition={{ delay: 0.3 }}
//                                 className="flex items-center justify-center gap-2 text-sm text-text-secondary"
//                             >
//                                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
//                                 <span>100% Anonymous</span>
//                                 <span className="mx-2">•</span>
//                                 <span>Only for @iub.edu.bd</span>
//                             </motion.div>
//                         </motion.div>
//                     </div>
//                 </section>
//             )}

//             {/* Feed Section */}
//             <section className="max-w-6xl mx-auto px-4 mt-5">
//                 <ConfessionFeed />
//             </section>
//         </div>
//     )
// }
'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Heart, Sparkles, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'

// 1. Lazy load the feed with no SSR to prevent hydration mismatches and blocking
const ConfessionFeed = dynamic(() => import('@/components/feed/ConfessionFeed'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center py-20 text-rose-primary/50">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <p className="text-sm font-medium animate-pulse">Loading Feed...</p>
        </div>
    )
})

export default function HomePage() {
    const { user } = useAuth()
    const router = useRouter()

    const handleConfessClick = () => {
        if (user) {
            const event = new CustomEvent('openCreateModal')
            window.dispatchEvent(event)
        } else {
            router.push('/login')
        }
    }

    return (
        <div className="relative min-h-screen bg-white">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <motion.div
                    className="absolute top-10 left-10 text-rose-light/30"
                    animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                >
                    <Heart className="w-16 h-16 fill-current" />
                </motion.div>
                <motion.div
                    className="absolute top-20 right-20 text-rose-light/20"
                    animate={{ y: [0, 10, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, delay: 1 }}
                >
                    <Heart className="w-24 h-24 fill-current" />
                </motion.div>
            </div>

            <div className="relative z-10">
                {!user && (
                    <section className="relative overflow-hidden bg-gradient-to-b from-rose-light/20 to-transparent py-12 md:py-20">
                        <div className="max-w-4xl mx-auto px-4 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                            >
                                <h1 className="font-heading text-4xl lg:text-6xl font-bold text-slate-900 mb-6 flex items-center flex-col md:flex-row gap-3 justify-center">
                                    Share Your True
                                    <div className='flex items-center gap-2'>
                                        <span className="text-rose-primary">Feelings</span>
                                        <Heart className="w-12 h-12 text-rose-primary fill-rose-primary animate-pulse" />
                                    </div>
                                </h1>

                                <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                                    Anonymous confessions from the IUB community.
                                    Express your feelings and connect with others.
                                </p>

                                <motion.button
                                    onClick={handleConfessClick}
                                    className="bg-rose-primary text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-rose-primary/40 flex items-center gap-2 mx-auto mb-6"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Heart className="w-5 h-5 fill-current" />
                                    Confess Your Feelings
                                </motion.button>

                                <div className="flex items-center justify-center gap-4 text-sm text-slate-500 font-medium">
                                    <span className="flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                        100% Anonymous
                                    </span>
                                    <span>•</span>
                                    <span>IUB Community</span>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                )}

                {/* 2. Feed Section wrapped in a container to prevent layout shift */}
                <section className="max-w-6xl mx-auto px-4 mt-8 pb-20 min-h-[400px]">
                    <React.Suspense fallback={<Loader2 className="animate-spin mx-auto mt-20" />}>
                        <ConfessionFeed />
                    </React.Suspense>
                </section>
            </div>
        </div>
    )
}