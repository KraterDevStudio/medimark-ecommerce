const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

// Create client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})

async function promoteAdmin(email) {
    console.log(`Searching for user with email: ${email}...`)

    // 1. Get user from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
        console.error('Error listing users:', authError)
        return
    }

    const authUser = users.find(u => u.email === email)

    if (!authUser) {
        console.error(`User with email ${email} not found in Supabase Auth.`)
        console.log('Available users:', users.map(u => u.email))
        return
    }

    console.log(`Found Auth User: ${authUser.id}. Updating/Creating profile...`)

    // 2. Upsert into user_profiles
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
            email: email,
            name: authUser.user_metadata.name || 'Admin',
            role: 'admin',
            auth_user_id: authUser.id
        }, { onConflict: 'email' })
        .select()

    if (profileError) {
        console.error('Error updating profile:', profileError)
        return
    }

    console.log('Success! User is now an admin:', profile[0])
}

const email = process.argv[2] || 'tester@medimark.com'
promoteAdmin(email)
