// Card color variants for confessions
export const CARD_COLORS = [
    { bg: 'bg-card-rose', border: 'border-rose-light/30', name: 'Rose' },
    { bg: 'bg-card-lavender', border: 'border-purple-200/30', name: 'Lavender' },
    { bg: 'bg-card-peach', border: 'border-orange-200/30', name: 'Peach' },
    { bg: 'bg-card-mint', border: 'border-green-200/30', name: 'Mint' },
    { bg: 'bg-card-sky', border: 'border-blue-200/30', name: 'Sky' },
] as const

export function getCardColor(index: number) {
    return CARD_COLORS[index % CARD_COLORS.length]
}

// Get a random color variant for new confessions
export function getRandomColorVariant(): number {
    return Math.floor(Math.random() * CARD_COLORS.length)
}
