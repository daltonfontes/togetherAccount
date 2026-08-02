'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chartChrome, statusPalette } from '@/lib/chart-colors';
import { useChartMode } from '@/lib/hooks/use-chart-mode';
import type { CashflowPoint } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

function monthLabel(value: string): string {
  const [year, month] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(year, month - 1, 1));
}

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];
  const status = statusPalette[mode];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Receitas x Despesas</CardTitle>
      </CardHeader>
      <CardContent className="h-72 pl-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} margin={{ left: 8, right: 16 }}>
            <CartesianGrid vertical={false} stroke={chrome.gridline} />
            <XAxis
              dataKey="month"
              tickFormatter={monthLabel}
              stroke={chrome.mutedInk}
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: chrome.baseline }}
            />
            <YAxis
              stroke={chrome.mutedInk}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value).replace(/ /g, ' ')}
              width={90}
            />
            <Tooltip
              cursor={{ fill: chrome.gridline, opacity: 0.4 }}
              contentStyle={{
                background: chrome.surface,
                border: `1px solid ${chrome.gridline}`,
                borderRadius: 8,
                fontSize: 12,
                color: chrome.primaryInk,
              }}
              formatter={(value: number, name) => [formatCurrency(value), name]}
              labelFormatter={(label) => monthLabel(String(label))}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: chrome.secondaryInk }} />
            <Bar dataKey="income" name="Receitas" fill={status.good} radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar
              dataKey="expense"
              name="Despesas"
              fill={status.critical}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
