'use client'

import { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import ImageCropper, { ImageCropperRef } from './ImageCropper'

interface ImageUploadProps {
    onFileSelect: (file: File | null) => void
    selectedFile: File | null
    disabled?: boolean
}

export interface ImageUploadRef {
    processImage: () => Promise<File | null>
}

const MAX_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

const ImageUpload = forwardRef<ImageUploadRef, ImageUploadProps>(({
    onFileSelect,
    selectedFile,
    disabled = false
}, ref) => {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const cropperRef = useRef<ImageCropperRef>(null)

    // Create preview URL when file changes
    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile)
            setPreviewUrl(url)
            return () => URL.revokeObjectURL(url)
        } else {
            setPreviewUrl(null)
        }
    }, [selectedFile])

    useImperativeHandle(ref, () => ({
        processImage: async () => {
            if (!selectedFile) return null
            
            // If we have a cropper, get the cropped blob
            if (cropperRef.current) {
                const blob = await cropperRef.current.getCroppedBlob()
                if (blob) {
                    return new File([blob], selectedFile.name, { type: 'image/jpeg' })
                }
            }
            
            // Fallback to original file if cropping fails or no cropper
            return selectedFile
        }
    }))

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Please upload an image (JPEG, PNG, GIF, or WebP)'
        }
        if (file.size > MAX_SIZE) {
            return 'Image must be less than 5MB'
        }
        return null
    }

    const handleFile = (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }
        setError(null)
        onFileSelect(file)
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFile(file)
        }
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
        if (file) {
            handleFile(file)
        }
    }

    const handleRemove = () => {
        onFileSelect(null)
        if (inputRef.current) inputRef.current.value = ''
    }

    if (selectedFile && previewUrl) {
        return (
            <ImageCropper
                ref={cropperRef}
                imageSrc={previewUrl}
                onCancel={handleRemove}
            />
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
                    disabled={disabled}
                />

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
})

ImageUpload.displayName = 'ImageUpload'

export default ImageUpload
