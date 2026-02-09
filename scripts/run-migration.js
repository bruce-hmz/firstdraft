#!/usr/bin/env node

/**
 * FirstDraft 数据库迁移脚本
 *
 * 使用方法:
 * 1. 设置环境变量后运行: node scripts/run-migration.js
 * 2. 或在 Supabase Dashboard SQL Editor 中直接执行 migrations/001_create_pages_table.sql
 */

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

async function runMigration() {
  console.log('开始执行数据库迁移...')

  const migrationPath = path.join(__dirname, '../migrations/001_create_pages_table.sql')
  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('读取迁移文件:', migrationPath)

  try {
    // 使用 Supabase 的 rpc 执行 SQL
    // 注意：由于 Supabase JS 客户端限制，需要移除验证脚本部分
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('SELECT'))

    for (const statement of statements) {
      if (statement.length > 10) {
        await supabase.rpc('exec_sql', { query: statement })
      }
    }

    console.log('迁移执行完成')

    // 验证
    const { data, error } = await supabase
      .from('pages')
      .select('id')
      .limit(1)

    if (error && error.code === 'PGRST116') {
      console.log('表可能未创建，请检查 SQL 执行结果')
    } else if (error) {
      console.log('验证失败:', error.message)
    } else {
      console.log('pages 表已就绪')
    }

  } catch (error) {
    console.log('自动执行失败，错误:', error.message)
    console.log('\n请手动在 Supabase Dashboard SQL Editor 中执行迁移文件')
    console.log('文件路径:', migrationPath)
  }
}

if (require.main === module) {
  runMigration()
}

module.exports = { runMigration }