'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/layout/empty-state';
import { Users } from 'lucide-react';
import { chartChrome, getCategoricalColor } from '@/lib/chart-colors';
import { useChartMode } from '@/lib/hooks/use-chart-mode';
import type { MemberSpending } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export function MemberSpendingChart({ data }: { data: MemberSpending[] }) {
  const mode = useChartMode();
  const chrome = chartChrome[mode];

  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos por pessoa</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState icon={Users} title="Sem despesas neste período" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Gastos por pessoa</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
            <CartesianGrid horizontal={false} stroke={chrome.gridline} />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} stroke={chrome.mutedInk} fontSize={12} />
            <YAxis type="category" dataKey="name" stroke={chrome.mutedInk} fontSize={12} width={100} />
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
              formatter={(value: number) => formatCurrency(value)}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={28} stroke={chrome.primaryInk} strokeWidth={2}>
              {data.map((entry, index) => (
                <Cell key={entry.userId} fill={getCategoricalColor(index, mode)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
