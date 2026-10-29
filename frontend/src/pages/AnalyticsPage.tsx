import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, PieChart as PieIcon, CheckCircle2, Clock4, XCircle } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { AnalyticsData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await dashboardApi.getAnalytics();
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating database analytics..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <p className="font-semibold">Unable to load analytics</p>
        <p className="text-sm mt-1">{error || 'Unknown error'}</p>
      </div>
    );
  }

  const { eventsByCategory, fundingPerEvent, statusBreakdown } = data;

  const formatLKR = (val: number) => `LKR ${(val / 1000).toFixed(0)}k`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Analytics & Funding Metrics
        </h1>
        <p className="text-sm text-slate-500">
          Real-time aggregated insights from SQLite database records.
        </p>
      </div>

      {/* Top Status Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statusBreakdown.map((item: { status: string; totalAmount: number; count: number }) => {
          const isAccepted = item.status === 'Accepted';
          const isPending = item.status === 'Pending';
          return (
            <div
              key={item.status}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.status} Pledges
                </span>
                <p
                  className={`text-2xl font-extrabold mt-1 ${
                    isAccepted
                      ? 'text-emerald-600'
                      : isPending
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                >
                  LKR {item.totalAmount.toLocaleString('en-LK')}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {item.count} recorded pledge record(s)
                </p>
              </div>

              <div
                className={`p-3 rounded-2xl ${
                  isAccepted
                    ? 'bg-emerald-50 text-emerald-600'
                    : isPending
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-rose-50 text-rose-600'
                }`}
              >
                {isAccepted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : isPending ? (
                  <Clock4 className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Funding vs Target per Event */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Target Budget vs Accepted Funding
              </h2>
              <p className="text-xs text-slate-500">Comparing funding achieved per campus event</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingPerEvent} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis tickFormatter={formatLKR} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [`LKR ${Number(value).toLocaleString('en-LK')}`, '']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="targetBudget" name="Target Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fundedAmount" name="Accepted Funding" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Events by Category */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Campus Events by Category
              </h2>
              <p className="text-xs text-slate-500">Distribution across university societies</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eventsByCategory} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="count" name="Event Count" fill="#4F46E5" radius={[6, 6, 0, 0]}>
                  {eventsByCategory.map((_: { category: string; count: number }, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
