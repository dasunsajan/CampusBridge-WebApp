import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Building2,
  HandCoins,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import { DashboardData, Event, Sponsorship } from '../types';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await dashboardApi.getStats();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading campus dashboard metrics..." />;
  }

  if (error || !data) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
        <p className="font-semibold">Unable to load dashboard</p>
        <p className="text-sm mt-1">{error || 'Unknown error occurred'}</p>
        <button
          onClick={fetchStats}
          className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-medium hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { overview, featuredEvents, recentPledges } = data;

  const formatLKR = (amount: number) => {
    return `LKR ${amount.toLocaleString('en-LK')}`;
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-medium border border-indigo-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Campus Sponsorship Ecosystem</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            CampusBridge Dashboard
          </h1>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            Connect university society initiatives with alumni and local business sponsors through verified micro-sponsorship pledges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/events"
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
          <Link
            to="/sponsorships"
            className="inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700"
          >
            <HandCoins className="w-4 h-4" />
            <span>Pledges</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Campus Events */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Campus Events
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {overview.totalEvents}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
            <span className="text-emerald-600 font-semibold">{overview.upcomingEvents} Upcoming</span>
            <span>scheduled</span>
          </p>
        </div>

        {/* Registered Sponsors */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Registered Sponsors
            </span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {overview.totalSponsors}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Local enterprises, alumni & businesses
          </p>
        </div>

        {/* Total Accepted Funding */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Accepted Sponsorship
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {formatLKR(overview.totalAccepted)}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center space-x-1">
            <span className="font-semibold text-slate-700">{overview.acceptedPledgesCount}</span>
            <span>confirmed pledge(s)</span>
          </p>
        </div>

        {/* Total Pledged Amount */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Pledged (All)
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <HandCoins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {formatLKR(overview.totalPledged)}
          </div>
          <p className="text-xs text-amber-600 mt-2 flex items-center space-x-1 font-medium">
            <span>{formatLKR(overview.totalPending)} pending review</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Featured Events & Recent Pledges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Featured Events Funding Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Active Events & Funding Progress
              </h2>
              <p className="text-xs text-slate-500">
                Tracking target budgets vs accepted micro-sponsorship amounts
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <span>View All Events</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredEvents.map((event: Event) => (
              <div
                key={event.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="primary" size="sm">
                      {event.category}
                    </Badge>
                    <Badge
                      variant={
                        event.status === 'UPCOMING'
                          ? 'info'
                          : event.status === 'ONGOING'
                          ? 'success'
                          : 'neutral'
                      }
                      size="sm"
                    >
                      {event.status}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">
                    {event.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="line-clamp-1">{event.venue}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-500">
                      Funded: <strong className="text-slate-900">{formatLKR(event.fundedAmount || 0)}</strong>
                    </span>
                    <span className="text-slate-400">
                      Target: {formatLKR(event.targetBudget)}
                    </span>
                  </div>
                  <ProgressBar progress={event.fundingPercentage || 0} size="sm" showLabel={false} />
                  <div className="mt-2 text-right">
                    <Link
                      to={`/events/${event.id}`}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      Event Details & Sponsors &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Recent Pledges Feed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Recent Pledges
                </h2>
                <p className="text-[11px] text-slate-500">Live pledge stream</p>
              </div>
              <Link
                to="/sponsorships"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentPledges.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No pledges recorded yet.
                </p>
              ) : (
                recentPledges.map((sp: Sponsorship) => (
                  <div
                    key={sp.id}
                    className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-800 line-clamp-1">
                        {sp.sponsor?.name || 'Anonymous Sponsor'}
                      </span>
                      <span className="font-bold text-xs text-indigo-600">
                        {formatLKR(sp.amount)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                      for {sp.event?.title || 'Campus Event'}
                    </p>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">
                        {new Date(sp.createdAt).toLocaleDateString('en-GB')}
                      </span>
                      <Badge
                        variant={
                          sp.status === 'ACCEPTED'
                            ? 'success'
                            : sp.status === 'PENDING'
                            ? 'warning'
                            : 'danger'
                        }
                        size="sm"
                      >
                        {sp.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-center">
            <Link
              to="/sponsorships"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Record New Sponsorship Pledge &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
