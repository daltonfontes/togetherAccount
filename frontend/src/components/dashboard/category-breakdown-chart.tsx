'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/layout/empty-state';
import { chartChrome, getCategoricalColor } from '@/lib/chart-colors';
import { useChartMode } from '@/lib/hooks/use-chart-mode';
import type { CategoryBreakdown } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PieChart as PieChartIcon } from 'lucide-react';

const MAX_SLICES = 7;

export function CategoryBreakdownChart({ data }: { data: CategoryBreakdown[] }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={PieChartIcon} title="Sem despesas neste período" />
        </CardContent>
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => b.total - a.total);
  const top = sorted.slice(0, MAX_SLICES);
  const rest = sorted.slice(MAX_SLICES);
  const restTotal = rest.reduce((sum, item) => sum + item.total, 0);
  const chartData = restTotal > 0 ? [...top, { categoryId: 'other', name: 'Outros', color: '', total: restTotal }] : top;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ bottom: 24 }}>
            <Pie
              key={chartData.map((entry) => entry.categoryId).join('-')}
              data={chartData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              isAnimationActive={false}
              stroke={chrome.primaryInk}
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={entry.categoryId} fill={getCategoricalColor(index, mode)} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: chrome.surface,
                border: `2px solid ${chrome.primaryInk}`,
                borderRadius: 8,
                boxShadow: `4px 4px 0px 0px ${chrome.primaryInk}`,
                fontSize: 12,
                fontWeight: 600,
                color: chrome.primaryInk,
              }}
              formatter={(value: number, name) => [formatCurrency(value), name]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 12, color: chrome.secondaryInk }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
