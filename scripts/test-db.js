#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function test() {
  console.log('Testing Supabase connection...')
  console.log('URL:', supabaseUrl)

  // Check if pages table exists
  console.log('\n1. Checking if pages table exists...')
  const { data, error } = await supabase
    .from('pages')
    .select('count')
    .limit(1)

  if (error) {
    console.log('Error:', error.message)
    console.log('Code:', error.code)
    if (error.code === 'PGRST116') {
      console.log('\n>>> pages table does not exist!')
      console.log('Please execute the SQL migration in Supabase Dashboard.')
    }
  } else {
    console.log('✓ pages table exists and is accessible')
  }

  // Check RLS policies
  console.log('\n2. Checking RLS policies...')
  const { data: policies, error: policyError } = await supabase
    .rpc('get_policies', { table_name: 'pages' })
    .catch(() => ({ data: null, error: { message: 'Cannot fetch policies via RPC' } }))

  if (policyError) {
    console.log('Cannot check policies via RPC:', policyError.message)
    console.log('Please check RLS policies manually in Supabase Dashboard.')
  } else if (policies) {
    console.log('Policies:', JSON.stringify(policies, null, 2))
  }

  // Try to insert a test record
  console.log('\n3. Testing insert (should work with public insert policy)...')
  const { data: insertData, error: insertError } = await supabase
    .from('pages')
    .insert({
      slug: 'test123',
      title: 'Test Page',
      content: { productName: 'Test', tagline: 'Test tagline', description: 'Test desc', problemSection: { headline: 'Head', description: 'Desc', painPoints: [] }, solutionSection: { headline: 'Head', description: 'Desc', features: [] }, ctaSection: { text: 'CTA' } },
      metadata: {},
    })
    .select()
    .single()

  if (insertError) {
    console.log('Insert error:', insertError.message)
    console.log('Code:', insertError.code)
  } else {
    console.log('✓ Insert successful:', insertData.slug)
  }

  // Try to read the test record
  console.log('\n4. Testing read (should work with public read policy)...')
  const { data: readData, error: readError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'test123')
    .eq('status', 'active')
    .single()

  if (readError) {
    console.log('Read error:', readError.message)
    console.log('Code:', readError.code)
    if (readError.code === 'PGRST116') {
      console.log('>>> Record not found or RLS blocked access')
    }
  } else {
    console.log('✓ Read successful:', readData.slug)
  }

  // Clean up test record
  console.log('\n5. Cleaning up test record...')
  await supabase
    .from('pages')
    .update({ status: 'deleted' })
    .eq('slug', 'test123')

  console.log('✓ Cleanup done')
}

test().catch(console.error)
