#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少 Supabase 环境变量')
  console.error('请确保设置了 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runAuthMigration() {
  console.log('开始执行认证系统迁移...')

  const migrationPath = path.join(__dirname, '../supabase/migrations/20240210_add_user_auth.sql')
  
  if (!fs.existsSync(migrationPath)) {
    console.error('迁移文件不存在:', migrationPath)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  console.log('读取迁移文件:', migrationPath)

  try {
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    for (const statement of statements) {
      if (statement.length > 10) {
        console.log('执行:', statement.substring(0, 50) + '...')
        
        const { error } = await supabase.rpc('exec_sql', { query: statement })
        
        if (error) {
          console.log('执行失败 (可能已存在):', error.message)
        } else {
          console.log('执行成功')
        }
      }
    }

    console.log('认证系统迁移完成')

    const { data, error } = await supabase
      .from('pages')
      .select('id, user_id, anonymous_id')
      .limit(1)

    if (error) {
      console.log('验证失败:', error.message)
    } else {
      console.log('pages 表结构验证成功')
      console.log('新增字段:', Object.keys(data[0] || {}).filter(k => k.includes('user') || k.includes('anonymous')))
    }

  } catch (error) {
    console.log('自动执行失败，错误:', error.message)
    console.log('\n请手动在 Supabase Dashboard SQL Editor 中执行迁移文件')
    console.log('文件路径:', migrationPath)
  }
}

if (require.main === module) {
  runAuthMigration()
}

module.exports = { runAuthMigration }