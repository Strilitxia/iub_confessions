// Admin Configuration
// Update this list before going live with actual admin email addresses

export const ADMIN_EMAILS = ["2412497@iub.edu.bd"
]

// Check if an email is an admin
export function isAdminEmail(email: string): boolean {
    return ADMIN_EMAILS.includes(email.toLowerCase())
}

// Domain restriction for registration
export const ALLOWED_EMAIL_DOMAIN = '@iub.edu.bd'

export function isAllowedEmailDomain(email: string): boolean {
    return email.toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)
}
