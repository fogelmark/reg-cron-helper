"use client";

import { useState, useEffect } from 'react';
import { explainCron } from '@/lib/cron-explainer';

export default function CronTester() {
  const [expression, setExpression] = useState('');
  const [error, setError] = useState('');
  const [explanation, setExplanation] = useState('');
  const [nextExecutions, setNextExecutions] = useState<Date[]>([]);

  useEffect(() => {
    if (!expression) {
      setExplanation('');
      setNextExecutions([]);
      setError('');
      return;
    }

    const parseCron = async () => {
      try {
        // Dynamic import of cron-parser
        const { CronExpressionParser } = await import('cron-parser');

        // Validate and parse cron expression
        const interval = CronExpressionParser.parse(expression, {
          currentDate: new Date()
        });

        // Get next 10 executions using take()
        const executions = interval.take(10).map(date => date.toDate());

        // Get human-readable explanation
        const exp = explainCron(expression);

        setExplanation(exp);
        setNextExecutions(executions);
        setError('');
      } catch (e) {
        setError((e as Error).message);
        setExplanation('');
        setNextExecutions([]);
      }
    };

    parseCron();
  }, [expression]);

  const formatDateTime = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `in ${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return `in ${seconds} second${seconds !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Cron Expression Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Cron Expression</label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="* * * * * (minute hour day month weekday)"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: minute (0-59) | hour (0-23) | day (1-31) | month (1-12) | weekday (0-6, 0=Sunday)
        </p>
      </div>

      {/* Quick Examples */}
      <div>
        <h3 className="text-sm font-medium mb-2">Quick Templates</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Every minute', value: '* * * * *' },
            { label: 'Every hour', value: '0 * * * *' },
            { label: 'Daily at 9:00 AM', value: '0 9 * * *' },
            { label: 'Weekdays at 8:00 AM', value: '0 8 * * 1-5' },
            { label: 'Every 15 minutes', value: '*/15 * * * *' },
            { label: 'First day of month', value: '0 0 1 * *' },
          ].map((example) => (
            <button
              key={example.value}
              onClick={() => setExpression(example.value)}
              className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-sm transition-colors"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
          <p className="text-red-400 text-sm">
            <strong>Invalid cron expression:</strong> {error}
          </p>
        </div>
      )}

      {/* Explanation */}
      {!error && explanation && (
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2 text-blue-300">Explanation</h3>
          <p className="text-gray-200">{explanation}</p>
        </div>
      )}

      {/* Next Executions */}
      {!error && nextExecutions.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-3">Next Executions</h3>
          <div className="bg-gray-800 border border-gray-700 rounded-lg divide-y divide-gray-700">
            {nextExecutions.map((date, idx) => (
              <div key={idx} className="p-4 flex items-start justify-between hover:bg-gray-750 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mt-1">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-mono text-sm">{formatDateTime(date)}</div>
                    <div className="text-xs text-gray-500 mt-1">{getRelativeTime(date)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
