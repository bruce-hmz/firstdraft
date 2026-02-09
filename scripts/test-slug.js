#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSlug(slug) {
  console.log('Testing slug:', slug)

  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, status')
    .eq('slug', slug)
    .single()

  if (error) {
    console.log('Error:', error.message)
    console.log('Code:', error.code)
  } else {
    console.log('Found:', data)
  }

  // List all pages
  console.log('\nAll active pages:')
  const { data: allPages } = await supabase
    .from('pages')
    .select('id, slug, title, status')
    .eq('status', 'active')

  console.log(allPages)
}

testSlug('MCAHZxkc').catch(console.error)
