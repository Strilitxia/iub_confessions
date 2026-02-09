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
        relative overflow-hidden rounded-2xl p-6
        ${colorVariant.bg} ${colorVariant.border}
        border shadow-sm
      `}
        >
            {/* Content */}
            <div className="prose prose-rose max-w-none text-text-primary leading-relaxed">
                {renderContent()}
            </div>

            {/* Image */}
            {confession.image_url && (
                <div className="mt-4 relative rounded-xl overflow-hidden bg-blush aspect-[4/5] w-full">
                    {/* Loading and Fallback UI */}
                    {(isImageLoading || true) && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/50">
                            {true ? (
                                <>
                                    {/* <CircleAlert className="w-8 h-8 text-rose-300" /> */}
                                    <p className="text-xs mt-2 text-rose-400">Failed to load image</p>
                                </>
                            ) : (
                                <ImageIcon className="w-8 h-8 text-rose-light animate-pulse" />
                            )}
                        </div>
                    )}

                    {/* The Image */}
                    {true && (
                        <Image
                            src={confession.image_url}
                            alt="Confession image"
                            fill // Fills the 4:5 container
                            className={`object-cover transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'
                                }`}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => {
                                setIsImageLoading(false);

                            }}
                        />
                    )}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5">
                {/* Left: Time */}
                <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                    <Clock className="w-4 h-4" />
                    <span>{timeAgo}</span>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <UpvoteButton
                        count={confession.upvote_count}
                        hasVoted={confession.user_has_voted || false}
                        onVote={() => onVote(confession.id)}
                        disabled={!isAuthenticated}
                    />

                    {isAuthenticated && (
                        <motion.button
                            onClick={() => onReport(confession.id)}
                            className="p-2 rounded-full text-text-secondary hover:text-rose-dark hover:bg-rose-light/20 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Report"
                        >
                            <Flag className="w-4 h-4" />
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-rose-light/10 to-transparent pointer-events-none" />
        </motion.article>
    )
}
