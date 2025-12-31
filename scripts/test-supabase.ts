import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    console.log('Testing Supabase Connection...')
    console.log(`URL: ${supabaseUrl}`)

    try {
        // 1. Check Realtime (simple check)
        // We can't easily "test" realtime without a subscription, but client creation is a start.
        console.log('✅ Client initialized.')

        // 2. List Buckets (Storage)
        const { data: buckets, error: storageError } = await supabase.storage.listBuckets()
        if (storageError) {
            console.error('❌ Storage Error:', storageError.message)
        } else {
            console.log('✅ Storage Buckets:', buckets.map(b => b.name))
        }

        // 3. Invoke Edge Function
        const { data: funcData, error: funcError } = await supabase.functions.invoke('hello-world', {
            body: { name: 'Supabase' },
        })

        if (funcError) {
            // Edge functions might not be deployed yet, so this is expected to fail locally unless proxied.
            console.warn('⚠️ Edge Function Check:', funcError.message)
        } else {
            console.log('✅ Edge Function Response:', funcData)
        }

    } catch (error) {
        console.error('Unexpected error:', error)
    }
}

testConnection()
