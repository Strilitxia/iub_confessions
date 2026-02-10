'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X, Send } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import RichTextEditor from './RichTextEditor'
import ImageUpload, { ImageUploadRef } from './ImageUpload'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'
import { getRandomColorVariant } from '@/lib/utils/colors'

export default function CreatePostModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const imageUploadRef = useRef<ImageUploadRef>(null)

    const { user } = useAuth()
    const { toast } = useToast()
    const supabase = createClient()

    // Listen for open modal event from header
    useEffect(() => {
        const handleOpen = () => setIsOpen(true)
        window.addEventListener('openCreateModal', handleOpen)
        return () => window.removeEventListener('openCreateModal', handleOpen)
    }, [])

    const uploadImage = async (file: File): Promise<string> => {
        const ext = file.name.split('.').pop()
        const filename = `${crypto.randomUUID()}.${ext}`
        const path = `confessions/${filename}`

        const { error: uploadError } = await supabase.storage
            .from('confessions')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('confessions')
            .getPublicUrl(path)

        return publicUrl
    }

    const handleSubmit = async () => {
        if (!user) {
            toast('Please login to post', 'warning')
            return
        }

        // Validate content
        try {
            const parsedContent = JSON.parse(content)
            const text = parsedContent.content
                ?.map((node: any) => node.content?.map((c: any) => c.text || '').join('') || '')
                .join('') || ''

            if (text.trim().length < 10) {
                toast('Please write at least 10 characters', 'warning')
                return
            }
        } catch {
            toast('Please write something', 'warning')
            return
        }

        setIsSubmitting(true)

        try {
            let uploadedImageUrl = null

            // Process image (crop if needed)
            let fileToUpload = imageFile
            if (imageUploadRef.current) {
                const processed = await imageUploadRef.current.processImage()
                if (processed) {
                    fileToUpload = processed
                }
            }

            if (fileToUpload) {
                uploadedImageUrl = await uploadImage(fileToUpload)
            }

            const { error } = await supabase
                .from('confessions')
                .insert({
                    user_id: user.id,
                    content: JSON.parse(content),
                    image_url: uploadedImageUrl,
                    color_variant: getRandomColorVariant(),
                })

            if (error) throw error

            toast('Confession submitted! It will appear after review.', 'success')
            handleClose()
        } catch (error) {
            console.error('Submit error:', error)
            toast('Failed to submit confession', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setContent('')
        setImageFile(null)
        setIsOpen(false)
    }

    if (!user) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-blush bg-gradient-to-r from-rose-light/20 to-transparent">
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-rose-primary fill-rose-light" />
                                <h2 className="font-heading text-xl font-semibold text-text-primary">
                                    Write a Confession
                                </h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 rounded-full text-text-secondary hover:bg-blush transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Editor */}
                            <div className="relative">
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder="Share your feelings anonymously..."
                                    maxLength={1000}
                                />
                            </div>

                            {/* Image Upload */}
                            <ImageUpload
                                ref={imageUploadRef}
                                selectedFile={imageFile}
                                onFileSelect={setImageFile}
                                disabled={isSubmitting}
                            />

                            {/* Info */}
                            <p className="text-xs text-text-secondary">
                                Your confession will be reviewed before appearing publicly.
                                Please follow our community guidelines.
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-blush bg-blush/30">
                            <p className="text-xs text-text-secondary">
                                Posting as <span className="font-medium">Anonymous</span>
                            </p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleSubmit}
                                    isLoading={isSubmitting}
                                    className="gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
