// Card color variants for confessions
export const CARD_COLORS = [
    { bg: 'bg-[#EF919E]', border: 'border-[#EF919E]/50', name: 'Color 1' },
    { bg: 'bg-[#F4A9B2]', border: 'border-[#F4A9B2]/50', name: 'Color 2' },
    { bg: 'bg-[#FEEDCB]', border: 'border-[#FEEDCB]/50', name: 'Color 3' },
    { bg: 'bg-[#F7DF9B]', border: 'border-[#F7DF9B]/50', name: 'Color 4' },
    { bg: 'bg-[#AFC0BC]', border: 'border-[#AFC0BC]/50', name: 'Color 5' },
] as const

export function getCardColor(index: number) {
    return CARD_COLORS[index % CARD_COLORS.length]
}

// Get a random color variant for new confessions
export function getRandomColorVariant(): number {
    return Math.floor(Math.random() * CARD_COLORS.length)
}
