'use client';

import { AbacusDashboard, useDashboardData } from '@/components/viz/abacus-dashboard';

const reportsManifest = {
  title: 'Sales performance is trending upward across all reps.',
  eyebrow: 'Sales CRM · Reports',
  subtitle: 'Performance analytics, conversion rates, and win/loss analysis.',
  theme: 'app' as const,
  tiles: [
    {
      id: 'kpi_pipeline',
      type: 'kpi',
      span: 3,
      data: 'kpis',
      where: { metric: 'pipeline' },
      accent: 'accent',
      icon: 'dollar',
    },
    {
      id: 'kpi_revenue',
      type: 'kpi',
      span: 3,
      data: 'kpis',
      where: { metric: 'revenue' },
      accent: 'accent-2',
      icon: 'trending-up',
    },
    {
      id: 'kpi_conversion',
      type: 'kpi',
      span: 3,
      data: 'kpis',
      where: { metric: 'conversion' },
      accent: 'accent-3',
      icon: 'target',
    },
    {
      id: 'kpi_avg_deal',
      type: 'kpi',
      span: 3,
      data: 'kpis',
      where: { metric: 'avg_deal' },
      accent: 'accent',
      icon: 'chart',
    },
    {
      id: 'revenue_trend',
      type: 'area',
      span: 12,
      title: 'Monthly Revenue Trend',
      subtitle: 'Predicted vs Actual, 2026',
      insight: 'Actual revenue has consistently tracked above predictions in the second half.',
      data: 'revenue_trend',
      x: 'month',
      series: [
        { field: 'predicted', label: 'Predicted' },
        { field: 'actual', label: 'Actual' },
      ],
      unit: '$',
    },
    {
      id: 'leaderboard_full',
      type: 'bar',
      span: 6,
      title: 'Sales Performance by Rep',
      subtitle: 'Won revenue',
      insight: 'Revenue distribution shows strong team performance.',
      data: 'leaderboard',
      category: 'category',
      value: 'value',
      format: 'currency_compact',
      sort: 'desc',
    },
    {
      id: 'pipeline_funnel_full',
      type: 'funnel',
      span: 6,
      title: 'Pipeline Conversion',
      subtitle: 'Deals through each stage',
      insight: 'The funnel shows healthy progression with good conversion at each stage.',
      data: 'funnel',
      category: 'category',
      value: 'value',
    },
  ],
};

export default function ReportsPage() {
  const { data, dataAsOf } = useDashboardData('/api/dashboard', 60_000);
  return <AbacusDashboard manifest={reportsManifest as any} data={data} dataAsOf={dataAsOf} className="min-h-screen" />;
}
