#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('Testing with ANON key (public access)...')
  console.log('URL:', supabaseUrl)

  // Test 1: Insert a page
  console.log('\n1. Inserting test page...')
  const testSlug = 'test' + Date.now().toString().slice(-6)
  const { data: insertData, error: insertError } = await supabase
    .from('pages')
    .insert({
      slug: testSlug,
      title: 'Test Page',
      content: {
        productName: 'Test Product',
        tagline: 'Test tagline',
        description: 'Test description',
        problemSection: {
          headline: 'Test Problem',
          description: 'Test problem description',
          painPoints: ['Pain point 1', 'Pain point 2']
        },
        solutionSection: {
          headline: 'Test Solution',
          description: 'Test solution description',
          features: [
            { title: 'Feature 1', description: 'Desc 1', icon: '✨' }
          ]
        },
        ctaSection: {
          text: 'Get Started',
          subtext: 'Free trial'
        }
      },
      metadata: { test: true }
    })
    .select()
    .single()

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message)
    console.log('Code:', insertError.code)
    console.log('Details:', insertError.details)
  } else {
    console.log('✅ Insert successful!')
    console.log('Inserted slug:', insertData.slug)
    console.log('Page ID:', insertData.id)
  }

  // Test 2: Read the page we just inserted
  console.log('\n2. Reading test page...')
  const { data: readData, error: readError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', testSlug)
    .eq('status', 'active')
    .single()

  if (readError) {
    console.log('❌ Read failed:', readError.message)
    console.log('Code:', readError.code)
    if (readError.code === 'PGRST116') {
      console.log('>>> Record not found or RLS blocked access')
    }
  } else {
    console.log('✅ Read successful!')
    console.log('Title:', readData.title)
    console.log('Product:', readData.content.productName)
  }

  // Test 3: Read demo page
  console.log('\n3. Reading demo page (demo123)...')
  const { data: demoData, error: demoError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', 'demo123')
    .eq('status', 'active')
    .single()

  if (demoError) {
    console.log('❌ Demo page not found or error:', demoError.message)
  } else {
    console.log('✅ Demo page found!')
    console.log('Title:', demoData.title)
  }

  // Cleanup
  console.log('\n4. Cleaning up test page...')
  await supabase
    .from('pages')
    .update({ status: 'deleted' })
    .eq('slug', testSlug)
  console.log('✅ Cleanup done')

  console.log('\n=== Summary ===')
  if (insertError || readError) {
    console.log('❌ There may be RLS or permission issues')
  } else {
    console.log('✅ Database connection and RLS working correctly')
  }
}

test().catch(console.error)
