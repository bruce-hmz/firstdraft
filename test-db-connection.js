const { createClient } = require('@supabase/supabase-js');

// 直接硬编码环境变量进行测试
const supabaseUrl = 'https://imznfrowchoiqthhijzl.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imltem5mcm93Y2hvaXF0aGhpanpsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5OTk5MSwiZXhwIjoyMDg0Mzc1OTkxfQ.LcvRncbZ_L3Z0zl-eEYrWVYtEsMiEngwFBEEMMAzTGM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // 测试连接
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Auth test:', user ? 'Success' : 'No user');
    
    // 检查 pages 表是否存在
    console.log('\nChecking pages table...');
    const { data, error } = await supabase
      .from('pages')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking pages table:', error);
    } else {
      console.log('Pages table exists:', data ? 'Yes' : 'No data');
    }
    
    // 检查 generate_unique_slug 函数
    console.log('\nTesting generate_unique_slug function...');
    try {
      const { data: slug, error: slugError } = await supabase.rpc('generate_unique_slug');
      if (slugError) {
        console.error('Error calling generate_unique_slug:', slugError);
      } else {
        console.log('Generated slug:', slug);
      }
    } catch (e) {
      console.error('Exception calling generate_unique_slug:', e);
    }
    
  } catch (error) {
    console.error('Connection error:', error);
  }
}

testConnection();