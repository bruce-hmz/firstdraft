'use client';

import { useState } from 'react';

export default function DiagnosticsPage() {
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<any[]>([]);

  const runDiagnostics = async () => {
    setResults([]);
    setStep(1);

    // Step 1: Check API directly
    try {
      const res = await fetch('/api/billing/plans');
      const data = await res.json();
      setResults(prev => [...prev, { step: 1, name: 'API 测试', data }]);
      
      if (data.plans && data.plans.length > 0) {
        setStep(999); // Success
        return;
      }
    } catch (err: any) {
      setResults(prev => [...prev, { step: 1, name: 'API 测试', error: err.message }]);
    }

    setStep(2);

    // Step 2: Check database
    try {
      const res = await fetch('/api/debug/db-check');
      const data = await res.json();
      setResults(prev => [...prev, { step: 2, name: '数据库检查', data }]);
    } catch (err: any) {
      setResults(prev => [...prev, { step: 2, name: '数据库检查', error: err.message }]);
    }

    setStep(3);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Paywall 问题诊断</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <h2 className="font-semibold text-yellow-800 mb-2">排查步骤：</h2>
        <ol className="list-decimal list-inside space-y-2 text-yellow-700">
          <li>点击下方按钮运行诊断</li>
          <li>查看 API 是否能返回套餐数据</li>
          <li>检查数据库表是否存在</li>
          <li>根据诊断结果执行修复</li>
        </ol>
      </div>

      <button
        onClick={runDiagnostics}
        disabled={step > 0 && step < 999}
        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mb-6"
      >
        {step === 0 ? '开始诊断' : step === 999 ? '诊断完成' : '诊断中...'}
      </button>

      {results.map((result, idx) => (
        <div key={idx} className="mb-4 bg-gray-50 p-4 rounded">
          <h3 className="font-semibold mb-2">步骤 {result.step}: {result.name}</h3>
          {result.error ? (
            <div className="text-red-600">错误: {result.error}</div>
          ) : (
            <pre className="bg-white p-3 rounded text-sm overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          )}
        </div>
      ))}

      {step === 999 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h2 className="font-semibold text-green-800 mb-2">✅ 诊断成功！</h2>
          <p className="text-green-700">
            API 正常返回套餐数据。如果 Paywall 仍然不显示，请刷新页面或检查浏览器控制台。
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mt-4">
          <h2 className="font-semibold text-red-800 mb-2">❌ 发现问题</h2>
          <p className="text-red-700 mb-4">
            数据库可能未正确配置。请在 Supabase SQL Editor 中执行以下脚本：
          </p>
          <div className="bg-gray-800 text-white p-4 rounded text-sm overflow-auto">
            <ol className="list-decimal list-inside space-y-2">
              <li>执行 004_pay_per_use.sql 创建表和数据</li>
              <li>执行 005_fix_rls.sql 修复权限</li>
              <li>刷新此页面重新诊断</li>
            </ol>
          </div>
        </div>
      )}

      <div className="mt-8 border-t pt-4">
        <h3 className="font-semibold mb-2">手动检查链接：</h3>
        <ul className="space-y-2">
          <li>
            <a href="/api/billing/plans" target="_blank" className="text-blue-500 hover:underline">
              直接测试 API →
            </a>
          </li>
          <li>
            <a href="/api/debug/db-check" target="_blank" className="text-blue-500 hover:underline">
              数据库状态检查 →
            </a>
          </li>
          <li>
            <a href="/test/plans" target="_blank" className="text-blue-500 hover:underline">
              套餐列表测试页 →
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
