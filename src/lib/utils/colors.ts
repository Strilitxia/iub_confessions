// Card color variants for confessions
export const CARD_COLORS = [
    { bg: 'bg-rose-50', border: 'border-rose-200', name: 'Rose' },
    { bg: 'bg-purple-50', border: 'border-purple-200', name: 'Lavender' },
    { bg: 'bg-orange-50', border: 'border-orange-200', name: 'Peach' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200', name: 'Mint' },
    { bg: 'bg-sky-50', border: 'border-sky-200', name: 'Sky' },
    { bg: 'bg-pink-50', border: 'border-pink-200', name: 'Blush' },
    { bg: 'bg-amber-50', border: 'border-amber-200', name: 'Honey' },
    { bg: 'bg-slate-50', border: 'border-slate-200', name: 'Slate' },
] as const

export function getCardColor(index: number | undefined | null) {
    if (index === undefined || index === null) return CARD_COLORS[0]
    return CARD_COLORS[Math.abs(index) % CARD_COLORS.length]
}

// Get a random color variant for new confessions
export function getRandomColorVariant(): number {
    return Math.floor(Math.random() * CARD_COLORS.length)
}
