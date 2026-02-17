const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

dotenv.config({ path: path.join(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugProfiles() {
    const { data, error } = await supabase
        .from('user_profiles')
        .select('*')

    if (error) {
        console.error('Error fetching profiles:', error)
        return
    }

    console.log('User Profiles in Database:', JSON.stringify(data, null, 2))
}

debugProfiles()
