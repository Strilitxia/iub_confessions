#!/bin/bash

# Get your access token from https://supabase.com/dashboard/account/tokens
# Get your project ref from your Supabase URL (the part before .supabase.co)

SUPABASE_ACCESS_TOKEN="your-access-token-here"
PROJECT_REF="xgifgldytcniuaekwaze"  # From your .env.local URL

echo "Current rate limits:"
curl -X GET "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  | jq 'to_entries | map(select(.key | startswith("rate_limit_"))) | from_entries'

echo -e "\n\nUpdating rate limits for development..."
curl -X PATCH "https://api.supabase.com/v1/projects/$PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rate_limit_email_sent": 30,
    "rate_limit_otp": 30
  }'

echo -e "\n\nDone! Rate limits updated."
