'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface ConfigStatus {
  appId: string;
  privateKey: string;
  publicKey: string;
  gateway: string;
  isSandbox: boolean;
  appUrl: string;
}

export default function AlipayTestPage() {
  const [config, setConfig] = useState<ConfigStatus | null>(null);
  const [issues, setIssues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    try {
      const res = await fetch('/api/debug/alipay-config');
      const data = await res.json();
      setConfig(data.config);
      setIssues(data.issues || []);
    } catch (error) {
      console.error('Failed to check config:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateOrder = async () => {
    setTestResult('正在创建测试订单...');
    try {
      // 获取第一个可用套餐
      const plansRes = await fetch('/api/billing/plans');
      const plansData = await plansRes.json();
      
      if (!plansData.plans?.length) {
        setTestResult('错误：没有可用的套餐');
        return;
      }

      const testPlan = plansData.plans[0];
      
      const res = await fetch('/api/billing/alipay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: testPlan.id }),
      });

      const data = await res.json();
      
      if (data.error) {
        setTestResult(`创建订单失败: ${data.error}`);
      } else {
        setTestResult(`✅ 订单创建成功！订单号: ${data.orderNo}`);
        if (data.payUrl) {
          window.open(data.payUrl, '_blank');
        }
      }
    } catch (error) {
      setTestResult(`错误: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-neutral-900">支付宝沙箱测试</h1>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              配置状态
              {issues.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {config && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">APPID:</span>
                  <span className={config.appId === '已配置' ? 'text-green-600' : 'text-red-600'}>
                    {config.appId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">应用私钥:</span>
                  <span className={config.privateKey === '已配置' ? 'text-green-600' : 'text-red-600'}>
                    {config.privateKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">支付宝公钥:</span>
                  <span className={config.publicKey === '已配置' ? 'text-green-600' : 'text-red-600'}>
                    {config.publicKey}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">网关地址:</span>
                  <span className="text-neutral-900">{config.gateway}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">环境:</span>
                  <span className={config.isSandbox ? 'text-blue-600' : 'text-orange-600'}>
                    {config.isSandbox ? '沙箱环境' : '生产环境'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">应用URL:</span>
                  <span className="text-neutral-900">{config.appUrl}</span>
                </div>
              </div>
            )}

            {issues.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2">
                    {issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {issues.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>测试支付</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600">
                点击下方按钮创建测试订单，会跳转到支付宝沙箱支付页面。
              </p>
              <Button onClick={testCreateOrder} className="w-full">
                创建测试订单
              </Button>
              {testResult && (
                <Alert>
                  <AlertDescription className="text-sm">{testResult}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>配置指南</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-neutral-600">
            <ol className="list-decimal list-inside space-y-2">
              <li>访问 <a href="https://open.alipay.com/develop/sandbox/app" target="_blank" className="text-blue-600 hover:underline">支付宝沙箱平台</a></li>
              <li>复制沙箱应用的 APPID</li>
              <li>使用密钥工具生成 RSA2 密钥对</li>
              <li>在沙箱应用设置公钥，复制支付宝公钥</li>
              <li>将配置填入 <code className="bg-neutral-100 px-1 rounded">.env.local</code> 文件</li>
              <li>重启应用</li>
            </ol>
            <div className="bg-blue-50 p-3 rounded text-blue-700">
              <strong>沙箱测试账号：</strong>
              <br />
              在沙箱平台左侧菜单 "沙箱账号" 中查看买家账号
              <br />
              支付密码默认为：111111
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
