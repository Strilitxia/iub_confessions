'use client'

import { motion } from 'framer-motion'
import { Flag, Clock, Image as ImageIcon, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ConfessionWithProfile } from '@/types/database'
import { getCardColor } from '@/lib/utils/colors'
import UpvoteButton from './UpvoteButton'
import { useState } from 'react'
import Image from 'next/image'

interface ConfessionCardProps {
    confession: ConfessionWithProfile
    index: number
    onVote: (confessionId: string) => Promise<void>
    onReport: (confessionId: string) => void
    isAuthenticated: boolean
    className?: string // Added for Bento spanning
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring' as const,
            damping: 20,
            stiffness: 100,
        }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
    hover: {
        scale: 1.01,
        boxShadow: '0 10px 30px rgba(225, 29, 72, 0.12)',
        transition: { duration: 0.2 }
    },
}

export default function ConfessionCard({
    confession,
    index,
    onVote,
    onReport,
    isAuthenticated,
    className = ""
}: ConfessionCardProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const [imageError, setImageError] = useState(false)
    const colorVariant = getCardColor(confession.color_variant)

    const renderContent = () => {
        if (!confession.content) return null
        try {
            const content = typeof confession.content === 'string'
                ? JSON.parse(confession.content)
                : confession.content

            return content.content?.map((node: any, i: number) => {
                if (node.type === 'paragraph') {
                    const text = node.content?.map((child: any) => {
                        let text = child.text || ''
                        if (child.marks) {
                            child.marks.forEach((mark: any) => {
                                if (mark.type === 'bold') text = `<strong>${text}</strong>`
                                if (mark.type === 'italic') text = `<em>${text}</em>`
                                if (mark.type === 'underline') text = `<u>${text}</u>`
                            })
                        }
                        return text
                    }).join('') || ''

                    const alignClass = node.attrs?.textAlign ? `text-${node.attrs.textAlign}` : ''
                    return (
                        <p key={i} className={`mb-2 last:mb-0 ${alignClass}`} dangerouslySetInnerHTML={{ __html: text }} />
                    )
                }
                return null
            })
        } catch {
            return <p>{String(confession.content)}</p>
        }
    }

    const timeAgo = formatDistanceToNow(new Date(confession.created_at), { addSuffix: true })

    return (
        <motion.article
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`
                relative overflow-hidden rounded-3xl p-6 border-2 
                flex flex-col h-full transition-all duration-300
                ${colorVariant.bg} ${colorVariant.border}
                ${className}
            `}
        >
            {/* Header / Content Area (Grows to push footer down) */}
            <div className="flex-grow">
                <div className="prose prose-rose prose-sm md:prose-base leading-relaxed break-words max-w-none">
                    {renderContent()}
                </div>

                {/* Image Section */}
                {confession.image_url && (
                    <div className="mt-4 relative rounded-2xl overflow-hidden aspect-video w-full bg-black/5">
                        {isImageLoading && !imageError && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <ImageIcon className="w-6 h-6 text-rose-300 animate-pulse" />
                            </div>
                        )}
                        
                        {imageError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50/50">
                                <AlertCircle className="w-6 h-6 text-rose-300" />
                                <p className="text-[10px] mt-1 text-rose-400 font-medium">Image unavailable</p>
                            </div>
                        ) : (
                            <Image
                                src={confession.image_url}
                                alt="Confession"
                                fill
                                className={`object-cover transition-opacity duration-500 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => setIsImageLoading(false)}
                                onError={() => {
                                    setIsImageLoading(false)
                                    setImageError(true)
                                }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Footer - Stays at bottom */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5">
                <div className="flex items-center gap-1.5 text-[12px] font-medium text-text-secondary">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{timeAgo}</span>
                </div>

                <div className="flex items-center gap-2">
                    <UpvoteButton
                        count={confession.upvote_count}
                        hasVoted={!!confession.user_has_voted}
                        onVote={() => onVote(confession.id)}
                    />

                    {isAuthenticated && (
                        <button
                            onClick={() => onReport(confession.id)}
                            className="p-2 rounded-xl text-text-secondary hover:text-rose-600 hover:bg-white/50 transition-all"
                            title="Report"
                        >
                            <Flag className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Subtle Gradient Glow */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/20 blur-3xl pointer-events-none rounded-full" />
        </motion.article>
    )
}
