#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testSaveAndRead() {
  const testSlug = 'test' + Date.now().toString().slice(-6)
  
  console.log('=== 测试保存功能 ===')
  console.log('Test slug:', testSlug)

  // 1. Insert via Service Role (bypass RLS)
  console.log('\n1. Inserting page...')
  
  const serviceSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: insertData, error: insertError } = await serviceSupabase
    .from('pages')
    .insert({
      slug: testSlug,
      title: '测试页面',
      content: {
        productName: '测试产品',
        tagline: '测试标语',
        description: '测试描述',
        problemSection: {
          headline: '问题标题',
          description: '问题描述',
          painPoints: ['痛点1', '痛点2']
        },
        solutionSection: {
          headline: '解决方案',
          description: '方案描述',
          features: [{ title: '功能1', description: '描述', icon: '✨' }]
        },
        ctaSection: { text: '开始', subtext: '免费' }
      },
      metadata: { test: true }
    })
    .select()
    .single()

  if (insertError) {
    console.log('❌ Insert failed:', insertError.message)
  } else {
    console.log('✅ Insert successful!')
    console.log('Inserted:', insertData.slug)
  }

  // 2. Read via Anon Key (public access)
  console.log('\n2. Reading page (via anon key)...')
  const { data: readData, error: readError } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', testSlug)
    .eq('status', 'active')
    .single()

  if (readError) {
    console.log('❌ Read failed:', readError.message)
    console.log('Code:', readError.code)
  } else {
    console.log('✅ Read successful!')
    console.log('Title:', readData.title)
  }

  // 3. Try via API URL
  console.log('\n3. Testing API URL access...')
  console.log('URL:', `http://localhost:3000/share/${testSlug}`)

  // 4. List all pages
  console.log('\n4. All active pages:')
  const { data: allPages } = await supabase
    .from('pages')
    .select('slug, title, status')

  console.log(JSON.stringify(allPages, null, 2))

  console.log('\n=== 完成 ===')
}

testSaveAndRead().catch(console.error)
