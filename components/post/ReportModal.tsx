'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/components/auth/AuthProvider'
import { createClient } from '@/lib/supabase/client'

interface ReportModalProps {
    isOpen: boolean
    onClose: () => void
    confessionId: string
}

const REPORT_REASONS = [
    { id: 'inappropriate', label: 'Inappropriate content' },
    { id: 'harassment', label: 'Harassment or bullying' },
    { id: 'spam', label: 'Spam or misleading' },
    { id: 'personal', label: 'Contains personal information' },
    { id: 'other', label: 'Other' },
]

export default function ReportModal({ isOpen, onClose, confessionId }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState<string>('')
    const [customReason, setCustomReason] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { user } = useAuth()
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async () => {
        if (!user) {
            toast('Please login to report', 'warning')
            return
        }

        if (!selectedReason) {
            toast('Please select a reason', 'warning')
            return
        }

        const reason = selectedReason === 'other'
            ? customReason.trim() || 'Other'
            : REPORT_REASONS.find(r => r.id === selectedReason)?.label || selectedReason

        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from('reports')
                .insert({
                    user_id: user.id,
                    confession_id: confessionId,
                    reason,
                })

            if (error) throw error

            toast('Report submitted. Thank you!', 'success')
            handleClose()
        } catch (error) {
            console.error('Report error:', error)
            toast('Failed to submit report', 'error')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        setSelectedReason('')
        setCustomReason('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Report Confession" size="md">
            <div className="space-y-4">
                {/* Warning */}
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        Reports are reviewed by moderators. False reports may result in account restrictions.
                    </p>
                </div>

                {/* Reasons */}
                <div className="space-y-2">
                    <p className="text-sm font-medium text-text-primary">Why are you reporting this?</p>
                    <div className="space-y-2">
                        {REPORT_REASONS.map((reason) => (
                            <motion.button
                                key={reason.id}
                                onClick={() => setSelectedReason(reason.id)}
                                className={`
                  w-full text-left px-4 py-3 rounded-lg border transition-colors
                  ${selectedReason === reason.id
                                        ? 'border-rose-primary bg-rose-primary/5 text-rose-dark'
                                        : 'border-blush hover:border-rose-light text-text-primary'
                                    }
                `}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                {reason.label}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Custom reason input */}
                <AnimatePresence>
                    {selectedReason === 'other' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <textarea
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please describe the issue..."
                                className="w-full p-3 border border-blush rounded-lg focus:outline-none focus:border-rose-light resize-none"
                                rows={3}
                                maxLength={500}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="ghost" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        disabled={!selectedReason}
                    >
                        Submit Report
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
