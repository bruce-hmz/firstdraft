import { AlipaySdk } from 'alipay-sdk';

// 初始化支付宝 SDK
export const alipaySdk = new AlipaySdk({
  appId: process.env.ALIPAY_APP_ID!,
  privateKey: process.env.ALIPAY_PRIVATE_KEY!,
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY!,
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
  signType: 'RSA2',
});

// 创建支付宝订单
export async function createAlipayOrder(
  orderNo: string,
  amount: number, // 单位：元
  subject: string,
  body: string,
  notifyUrl: string,
  returnUrl: string
) {
  const result = await alipaySdk.exec('alipay.trade.page.pay', {
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
  const result = await alipaySdk.exec('alipay.trade.query', {
    bizContent: {
      out_trade_no: orderNo,
    },
  });

  return result;
}

// 验证支付宝回调签名
export function verifyAlipayNotify(params: Record<string, string>) {
  return alipaySdk.checkNotifySign(params);
}
