'use client'

import { useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import { ZoomIn, ZoomOut, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import getCroppedImg from '@/lib/utils/image'

interface ImageCropperProps {
    imageSrc: string
    onCancel: () => void
}

export interface ImageCropperRef {
    getCroppedBlob: () => Promise<Blob | null>
}

const ImageCropper = forwardRef<ImageCropperRef, ImageCropperProps>(({ imageSrc, onCancel }, ref) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    useImperativeHandle(ref, () => ({
        getCroppedBlob: async () => {
            if (!croppedAreaPixels) return null
            try {
                return await getCroppedImg(imageSrc, croppedAreaPixels)
            } catch (e) {
                console.error(e)
                return null
            }
        }
    }))

    return (
        <div className="flex flex-col gap-4">
            <div className="relative w-full h-[300px] bg-black rounded-xl overflow-hidden">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={onCropChange}
                    onCropComplete={onCropCompleteHandler}
                    onZoomChange={onZoomChange}
                />
            </div>

            <div className="flex items-center gap-4 px-2">
                <ZoomOut className="w-4 h-4 text-text-secondary" />
                <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-rose-primary h-1 bg-blush rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-rose-primary [&::-webkit-slider-thumb]:rounded-full"
                />
                <ZoomIn className="w-4 h-4 text-text-secondary" />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={onCancel} type="button">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                </Button>
            </div>
        </div>
    )
})

ImageCropper.displayName = 'ImageCropper'

export default ImageCropper
