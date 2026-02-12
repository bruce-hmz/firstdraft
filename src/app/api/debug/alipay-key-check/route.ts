// 支付宝私钥格式检查工具
// 访问 /api/debug/alipay-key-check 检查你的私钥格式

import { NextResponse } from 'next/server';

export async function GET() {
  const privateKey = process.env.ALIPAY_PRIVATE_KEY;
  
  if (!privateKey) {
    return NextResponse.json({
      status: 'error',
      message: 'ALIPAY_PRIVATE_KEY 未设置',
    });
  }
  
  const checks = {
    hasContent: privateKey.length > 0,
    length: privateKey.length,
    hasBeginMarker: privateKey.includes('-----BEGIN'),
    hasEndMarker: privateKey.includes('-----END'),
    isPKCS1: privateKey.includes('-----BEGIN RSA PRIVATE KEY-----'),
    isPKCS8: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
    hasNewlines: privateKey.includes('\n'),
    lineCount: privateKey.split('\n').length,
  };
  
  let format = 'unknown';
  if (checks.isPKCS1) format = 'PKCS#1 (RSA PRIVATE KEY) - 正确格式';
  else if (checks.isPKCS8) format = 'PKCS#8 (PRIVATE KEY) - 需要转换';
  else if (checks.hasBeginMarker) format = '其他格式';
  else format = '裸密钥（无标记）';
  
  const issues = [];
  if (!checks.hasBeginMarker) {
    issues.push('缺少 BEGIN 标记，私钥可能不完整');
  }
  if (!checks.hasEndMarker) {
    issues.push('缺少 END 标记，私钥可能不完整');
  }
  if (checks.isPKCS8) {
    issues.push('当前是 PKCS#8 格式，Node.js crypto 需要 PKCS#1 格式');
    issues.push('解决方法：使用 openssl 转换：openssl rsa -in private.pem -out private_rsa.pem');
  }
  if (checks.length < 500) {
    issues.push('私钥长度过短，可能不完整');
  }
  
  // 显示密钥预览（前30和后30字符）
  const keyPreview = privateKey.length > 60 
    ? `${privateKey.substring(0, 30)}...${privateKey.substring(privateKey.length - 30)}`
    : privateKey;
  
  return NextResponse.json({
    status: issues.length === 0 ? 'ok' : 'warning',
    format,
    checks,
    keyPreview,
    issues,
    recommendations: [
      '1. 确保私钥包含完整的 -----BEGIN RSA PRIVATE KEY----- 和 -----END RSA PRIVATE KEY-----',
      '2. 每 64 个字符应该有一个换行符',
      '3. 在 .env.local 中使用双引号包裹私钥',
      '4. 换行符使用 \\n 表示',
      '5. 如果使用密钥工具生成，选择 "PKCS1 (RSA PRIVATE KEY)" 格式',
    ],
  });
}
