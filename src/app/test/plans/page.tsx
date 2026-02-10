'use client';

import { useEffect, useState } from 'react';

export default function TestPlansPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/billing/plans');
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">测试套餐 API</h1>
      
      {loading && <p>加载中...</p>}
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          错误: {error}
        </div>
      )}
      
      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">API 响应:</h2>
          <pre className="bg-white p-4 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
          
          {result.plans && result.plans.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">找到 {result.plans.length} 个套餐:</h3>
              <ul className="space-y-2">
                {result.plans.map((plan: any) => (
                  <li key={plan.id} className="bg-white p-3 rounded border">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-sm text-gray-600">
                      {plan.credits} 次 - ¥{(plan.price_cny / 100).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {result.plans && result.plans.length === 0 && (
            <div className="mt-4 text-orange-600">
              ⚠️ 没有找到套餐数据，请检查数据库迁移是否已执行
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={fetchPlans}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        重新加载
      </button>
    </div>
  );
}
