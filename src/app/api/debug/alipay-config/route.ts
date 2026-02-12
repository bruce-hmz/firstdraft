import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const config = {
      appId: process.env.ALIPAY_APP_ID ? '已配置' : '未配置',
      privateKey: process.env.ALIPAY_PRIVATE_KEY ? '已配置' : '未配置',
      publicKey: process.env.ALIPAY_PUBLIC_KEY ? '已配置' : '未配置',
      gateway: process.env.ALIPAY_GATEWAY || '未配置',
      isSandbox: process.env.ALIPAY_GATEWAY?.includes('alipaydev') || false,
      appUrl: process.env.NEXT_PUBLIC_APP_URL || '未配置',
    };

    const issues = [];
    
    if (!process.env.ALIPAY_APP_ID) {
      issues.push('缺少 ALIPAY_APP_ID');
    }
    if (!process.env.ALIPAY_PRIVATE_KEY) {
      issues.push('缺少 ALIPAY_PRIVATE_KEY');
    }
    if (!process.env.ALIPAY_PUBLIC_KEY) {
      issues.push('缺少 ALIPAY_PUBLIC_KEY');
    }
    if (!process.env.ALIPAY_GATEWAY) {
      issues.push('缺少 ALIPAY_GATEWAY');
    }
    if (!process.env.NEXT_PUBLIC_APP_URL) {
      issues.push('缺少 NEXT_PUBLIC_APP_URL（影响回调）');
    }

    return NextResponse.json({
      success: issues.length === 0,
      config: {
        ...config,
        privateKey: config.privateKey === '已配置' 
          ? `长度: ${process.env.ALIPAY_PRIVATE_KEY?.length} 字符` 
          : '未配置',
        publicKey: config.publicKey === '已配置'
          ? `长度: ${process.env.ALIPAY_PUBLIC_KEY?.length} 字符`
          : '未配置',
      },
      issues,
      tips: config.isSandbox 
        ? '当前使用沙箱环境，测试支付请使用沙箱账号: https://open.alipay.com/develop/sandbox/account'
        : '当前使用生产环境，确保应用已通过支付宝审核',
    });
  } catch (error) {
    console.error('Check alipay config error:', error);
    return NextResponse.json(
      { error: 'Failed to check config' },
      { status: 500 }
    );
  }
}
