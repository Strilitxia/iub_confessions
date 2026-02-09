import { Confession } from '@/types/database'

/**
 * Calculate a "featured" score for confessions using a modified Wilson Score
 * combined with time decay. This provides fair ranking that doesn't
 * disadvantage newer posts with fewer votes.
 */
export function calculateFeaturedScore(confession: Confession): number {
    const ageInHours = (Date.now() - new Date(confession.created_at).getTime()) / 3600000
    const gravity = 1.8 // Decay factor - higher = faster decay

    // Wilson score for upvotes (handles low vote counts better than simple average)
    const upvotes = confession.upvote_count
    const n = upvotes + 1 // Avoid division by zero
    const z = 1.96 // 95% confidence interval
    const phat = upvotes / n

    // Wilson score lower bound
    const wilsonScore = (phat + z * z / (2 * n) - z * Math.sqrt((phat * (1 - phat) + z * z / (4 * n)) / n)) / (1 + z * z / n)

    // Combine Wilson score with time decay (HN-style algorithm)
    return wilsonScore / Math.pow(ageInHours + 2, gravity)
}

/**
 * Sort confessions by featured score
 */
export function sortByFeatured(confessions: Confession[]): Confession[] {
    return [...confessions].sort((a, b) => {
        return calculateFeaturedScore(b) - calculateFeaturedScore(a)
    })
}

/**
 * Sort confessions by most recent first
 */
export function sortByLatest(confessions: Confession[]): Confession[] {
    return [...confessions].sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
}
