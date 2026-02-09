export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    username: string
                    email: string
                    is_admin: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    username: string
                    email: string
                    is_admin?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    email?: string
                    is_admin?: boolean
                    created_at?: string
                }
            }
            confessions: {
                Row: {
                    id: string
                    user_id: string | null
                    content: Json
                    image_url: string | null
                    color_variant: number
                    status: 'pending' | 'approved' | 'hidden' | 'removed'
                    upvote_count: number
                    created_at: string
                    approved_at: string | null
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    content: Json
                    image_url?: string | null
                    color_variant?: number
                    status?: 'pending' | 'approved' | 'hidden' | 'removed'
                    upvote_count?: number
                    created_at?: string
                    approved_at?: string | null
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    content?: Json
                    image_url?: string | null
                    color_variant?: number
                    status?: 'pending' | 'approved' | 'hidden' | 'removed'
                    upvote_count?: number
                    created_at?: string
                    approved_at?: string | null
                }
            }
            votes: {
                Row: {
                    id: string
                    user_id: string
                    confession_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    confession_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    confession_id?: string
                    created_at?: string
                }
            }
            reports: {
                Row: {
                    id: string
                    user_id: string
                    confession_id: string
                    reason: string
                    status: 'pending' | 'resolved' | 'dismissed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    confession_id: string
                    reason: string
                    status?: 'pending' | 'resolved' | 'dismissed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    confession_id?: string
                    reason?: string
                    status?: 'pending' | 'resolved' | 'dismissed'
                    created_at?: string
                }
            }
        }
    }
}

// Convenient type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Confession = Database['public']['Tables']['confessions']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type Report = Database['public']['Tables']['reports']['Row']

export type ConfessionStatus = 'pending' | 'approved' | 'hidden' | 'removed'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

// Extended types with relations
export interface ConfessionWithProfile extends Confession {
    profiles?: Profile | null
    user_has_voted?: boolean
}

export interface ReportWithConfession extends Report {
    confessions?: Confession
    profiles?: Profile
}
