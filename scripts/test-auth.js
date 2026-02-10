#!/usr/bin/env node

const testEmail = 'test@example.com'
const testPassword = 'test123456'

async function testDirectSignup() {
  console.log('🧪 测试直接注册...')
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/signup-direct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 直接注册成功:', data.data.user.email)
    } else {
      console.log('❌ 直接注册失败:', data.error)
    }
  } catch (error) {
    console.log('❌ 注册请求异常:', error.message)
  }
}

async function testLogin() {
  console.log('🧪 测试登录...')
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        action: 'signin',
      }),
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ 登录成功:', data.data.user.email)
    } else {
      console.log('❌ 登录失败:', data.error)
    }
  } catch (error) {
    console.log('❌ 登录请求异常:', error.message)
  }
}

async function testGetUser() {
  console.log('🧪 测试获取用户信息...')
  
  try {
    const response = await fetch('http://localhost:3000/api/auth/user')
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ 获取用户成功:', data.data?.email || '未登录')
    } else {
      console.log('❌ 获取用户失败:', response.status)
    }
  } catch (error) {
    console.log('❌ 获取用户异常:', error.message)
  }
}

async function runTests() {
  console.log('🚀 开始测试认证系统...\n')
  
  await testDirectSignup()
  console.log('')
  await testLogin()
  console.log('')
  await testGetUser()
  
  console.log('\n✨ 测试完成！')
}

if (require.main === module) {
  runTests()
}