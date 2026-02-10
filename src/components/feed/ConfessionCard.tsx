'use client'

import { motion } from 'framer-motion'
import { Flag, Clock, Image as ImageIcon } from 'lucide-react'
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
}

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            damping: 20,
            stiffness: 100,
        }
    },
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
    isAuthenticated
}: ConfessionCardProps) {
    const [isImageLoading, setIsImageLoading] = useState(true)
    const colorVariant = getCardColor(confession.color_variant)

    // Parse Tiptap content
    const renderContent = () => {
        if (!confession.content) return null

        try {
            const content = typeof confession.content === 'string'
                ? JSON.parse(confession.content)
                : confession.content

            // Simple Tiptap content renderer
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

                    const alignClass = node.attrs?.textAlign
                        ? `text-${node.attrs.textAlign}`
                        : ''

                    return (
                        <p
                            key={i}
                            className={`mb-2 last:mb-0 ${alignClass}`}
                            dangerouslySetInnerHTML={{ __html: text }}
                        />
                    )
                }
                return null
            })
        } catch {
            // Fallback for plain text
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
                relative overflow-hidden rounded-[2rem] p-8
                ${colorVariant.bg} ${colorVariant.border}
                border-2 shadow-sm flex flex-col h-full
                transition-all duration-300
            `}
        >
            {/* Content Container */}
            <div className="flex-1">
                {/* Content */}
                <div className="prose prose-rose max-w-none text-text-primary leading-relaxed text-lg font-medium break-words w-full">
                    {renderContent()}
                </div>

                {/* Image */}
                {confession.image_url && (
                    <div className="mt-6 relative rounded-2xl overflow-hidden bg-white/40 ring-1 ring-black/5 aspect-square w-full">
                        {/* Loading and Fallback UI */}
                        {isImageLoading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-light/10">
                                <ImageIcon className="w-10 h-10 text-rose-primary/20 animate-pulse" />
                            </div>
                        )}

                        {/* The Image */}
                        <Image
                            src={confession.image_url}
                            alt="Confession image"
                            fill
                            className={`object-cover transition-all duration-500 hover:scale-105 ${isImageLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                }`}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => setIsImageLoading(false)}
                        />
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
                {/* Left: Time */}
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-secondary/60">
                    <Clock className="w-4 h-4" />
                    <span>{timeAgo}</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    <UpvoteButton
                        count={confession.upvote_count}
                        hasVoted={confession.user_has_voted || false}
                        onVote={() => onVote(confession.id)}
                        disabled={!isAuthenticated}
                    />

                    {isAuthenticated && (
                        <motion.button
                            onClick={() => onReport(confession.id)}
                            className="p-2.5 rounded-full text-text-secondary hover:text-rose-primary hover:bg-rose-primary/10 transition-colors bg-black/5"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            title="Report"
                        >
                            <Flag className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-gradient-to-tr from-rose-light/20 to-transparent rounded-full blur-xl pointer-events-none" />
        </motion.article>
    )
}
