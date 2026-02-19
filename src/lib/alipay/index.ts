import { AlipaySdk } from 'alipay-sdk';

let alipaySdkInstance: AlipaySdk | null = null;

function getAlipaySdk(): AlipaySdk {
  if (!alipaySdkInstance) {
    const appId = process.env.ALIPAY_APP_ID;
    const privateKey = process.env.ALIPAY_PRIVATE_KEY;
    const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY;
    const gateway = process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do';

    if (!appId) {
      throw new Error('ALIPAY_APP_ID is not configured');
    }
    if (!privateKey) {
      throw new Error('ALIPAY_PRIVATE_KEY is not configured');
    }
    if (!alipayPublicKey) {
      throw new Error('ALIPAY_PUBLIC_KEY is not configured');
    }

    alipaySdkInstance = new AlipaySdk({
      appId,
      privateKey,
      alipayPublicKey,
      gateway,
      signType: 'RSA2',
      timeout: 30000,
    });

    console.log('Alipay SDK initialized:', {
      appId: appId.substring(0, 10) + '...',
      gateway,
      isSandbox: gateway.includes('alipaydev')
    });
  }
  return alipaySdkInstance;
}

// Export a proxy that lazily initializes AlipaySdk
export const alipaySdk = new Proxy({} as AlipaySdk, {
  get(target, prop) {
    const instance = getAlipaySdk()
    const value = (instance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
})

// 创建支付宝订单
export async function createAlipayOrder(
  orderNo: string,
  amount: number, // 单位：元
  subject: string,
  body: string,
  notifyUrl: string,
  returnUrl: string
) {
  const sdk = getAlipaySdk();
  const result = await sdk.exec('alipay.trade.page.pay', {
    notify_url: notifyUrl,
    return_url: returnUrl,
    bizContent: {
      out_trade_no: orderNo,
      product_code: 'FAST_INSTANT_TRADE_PAY',
      total_amount: (amount / 100).toFixed(2), // 转换为元
      subject,
      body,
    },
  });

  return result;
}

// 查询订单状态
export async function queryAlipayOrder(orderNo: string) {
  const sdk = getAlipaySdk();
  const result = await sdk.exec('alipay.trade.query', {
    bizContent: {
      out_trade_no: orderNo,
    },
  });

  return result;
}

// 验证支付宝回调签名
export function verifyAlipayNotify(params: Record<string, string>) {
  const sdk = getAlipaySdk();
  return sdk.checkNotifySign(params);
}
