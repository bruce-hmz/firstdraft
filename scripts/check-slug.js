#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkSlug() {
  const targetSlug = 'bHPOK3H6'
  
  console.log('Checking slug:', targetSlug)
  
  // 1. Check if slug exists
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, status')
    .eq('slug', targetSlug)
    .single()

  if (error) {
    console.log('Error:', error.message)
    console.log('Code:', error.code)
  } else {
    console.log('Found:', data)
  }

  // 2. List all pages
  console.log('\nAll pages (including deleted):')
  const { data: allPages } = await supabase
    .from('pages')
    .select('id, slug, title, status')

  console.log(JSON.stringify(allPages, null, 2))
}

checkSlug().catch(console.error)
