'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

interface ImageUploadProps {
    onUpload: (url: string) => void
    onRemove: () => void
    imageUrl: string | null
    disabled?: boolean
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export default function ImageUpload({
    onUpload,
    onRemove,
    imageUrl,
    disabled = false
}: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Please upload an image (JPEG, PNG, GIF, or WebP)'
        }
        if (file.size > MAX_SIZE) {
            return 'Image must be less than 5MB'
        }
        return null
    }

    const uploadFile = async (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        setError(null)
        setIsUploading(true)
        setUploadProgress(0)

        try {
            // Generate unique filename
            const ext = file.name.split('.').pop()
            const filename = `${crypto.randomUUID()}.${ext}`
            const path = `confessions/${filename}`

            // Simulate progress (Supabase doesn't provide real progress)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90))
            }, 100)

            const { error: uploadError } = await supabase.storage
                .from('confessions')
                .upload(path, file, {
                    cacheControl: '3600',
                    upsert: false,
                })

            clearInterval(progressInterval)

            if (uploadError) throw uploadError

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('confessions')
                .getPublicUrl(path)

            setUploadProgress(100)
            onUpload(publicUrl)
        } catch (err) {
            console.error('Upload error:', err)
            setError('Failed to upload image. Please try again.')
        } finally {
            setIsUploading(false)
            setUploadProgress(0)
        }
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) uploadFile(file)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) uploadFile(file)
    }

    if (imageUrl) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative rounded-xl overflow-hidden border border-blush"
            >
                <Image
                    src={imageUrl}
                    alt="Uploaded image"
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                />
                <motion.button
                    onClick={onRemove}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={disabled}
                >
                    <X className="w-4 h-4" />
                </motion.button>
            </motion.div>
        )
    }

    return (
        <div>
            <motion.div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => inputRef.current?.click()}
                className={`
          relative cursor-pointer rounded-xl border-2 border-dashed p-8
          transition-colors duration-200
          ${isDragging
                        ? 'border-rose-primary bg-rose-light/10'
                        : 'border-blush hover:border-rose-light'
                    }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
                whileHover={disabled ? {} : { scale: 1.01 }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED_TYPES.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled || isUploading}
                />

                <AnimatePresence mode="wait">
                    {isUploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <Loader className="w-8 h-8 text-rose-primary animate-spin" />
                            <div className="w-48 h-2 bg-blush rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-rose-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${uploadProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <p className="text-sm text-text-secondary">Uploading...</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-3"
                        >
                            <div className="p-3 bg-blush rounded-full">
                                {isDragging ? (
                                    <Upload className="w-6 h-6 text-rose-primary" />
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-rose-primary" />
                                )}
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-text-primary">
                                    {isDragging ? 'Drop image here' : 'Add an image'}
                                </p>
                                <p className="text-xs text-text-secondary mt-1">
                                    Drag & drop or click to select (Max 5MB)
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-red-500 mt-2"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}
