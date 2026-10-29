import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  MapPin,
  Clock,
  Building,
  ArrowLeft,
  HandCoins,
  Users,
  CheckCircle2,
  Clock4,
  XCircle,
  Plus,
} from 'lucide-react';
import { eventApi, sponsorApi, sponsorshipApi } from '../services/api';
import { Event, Sponsor, Sponsorship } from '../types';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Micro-Sponsorship Modal
  const [isPledgeModalOpen, setIsPledgeModalOpen] = useState(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState('');
  const [pledgeAmount, setPledgeAmount] = useState('');
  const [pledgeMessage, setPledgeMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const fetchEventDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await eventApi.getById(id);
      setEvent(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const fetchSponsors = async () => {
    try {
      const data = await sponsorApi.getAll();
      setSponsors(data);
      if (data.length > 0) {
        setSelectedSponsorId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load sponsors for modal', err);
    }
  };

  useEffect(() => {
    fetchEventDetails();
    fetchSponsors();
  }, [id]);

  const handlePledgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedSponsorId) return;

    const amountNum = Number(pledgeAmount);
    if (!amountNum || amountNum <= 0) {
      setModalError('Please enter a valid positive pledge amount');
      return;
    }

    try {
      setIsSubmitting(true);
      setModalError(null);
      await sponsorshipApi.create({
        eventId: id,
        sponsorId: selectedSponsorId,
        amount: amountNum,
        message: pledgeMessage,
        status: 'PENDING',
      });
      setIsPledgeModalOpen(false);
      setPledgeAmount('');
      setPledgeMessage('');
      setSuccessToast('Sponsorship pledge recorded successfully! Marked as PENDING review.');
      setTimeout(() => setSuccessToast(null), 4000);
      fetchEventDetails();
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit pledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading event details..." />;
  }

  if (error || !event) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800">Event Not Found</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'This event may have been removed.'}</p>
        <Link
          to="/events"
          className="mt-4 inline-flex items-center space-x-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Events</span>
        </Link>
      </div>
    );
  }

  const formatLKR = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Events Directory</span>
      </Link>

      {/* Hero Banner Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900">
          <img
            src={
              event.imageUrl ||
              'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80'
            }
            alt={event.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Badge variant="primary" size="md">
              {event.category}
            </Badge>
            <Badge
              variant={
                event.status === 'UPCOMING'
                  ? 'info'
                  : event.status === 'ONGOING'
                  ? 'success'
                  : event.status === 'COMPLETED'
                  ? 'neutral'
                  : 'danger'
              }
              size="md"
            >
              {event.status}
            </Badge>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
            <p className="text-xs text-indigo-300 font-semibold flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>{event.organizerName}</span>
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Info Strip */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 border-b border-slate-100 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100/70 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Date & Time</p>
              <p className="text-slate-800 font-semibold mt-0.5">
                {new Date(event.eventDate).toLocaleDateString('en-GB', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-100/70 text-indigo-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Venue Location</p>
              <p className="text-slate-800 font-semibold mt-0.5">{event.venue}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-100/70 text-emerald-600">
              <HandCoins className="w-4 h-4" />
            </div>
            <div>
              <p className="text-slate-400 font-medium">Target Sponsorship Budget</p>
              <p className="text-emerald-700 font-bold mt-0.5 text-sm">
                {formatLKR(event.targetBudget)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Description & Funding Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Event Description & Pledges List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900">About this Campus Event</h2>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Linked Sponsors / Pledges */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Micro-Sponsorship Pledges
                </h2>
                <p className="text-xs text-slate-500">
                  All pledges submitted by alumni, companies, and small businesses
                </p>
              </div>
              <button
                onClick={() => setIsPledgeModalOpen(true)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pledge Sponsorship</span>
              </button>
            </div>

            {(!event.sponsorships || event.sponsorships.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Pledges Yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Be the first alumni or business to pledge micro-sponsorship for this event.
                </p>
                <button
                  onClick={() => setIsPledgeModalOpen(true)}
                  className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Record a Pledge &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {event.sponsorships.map((sp: Sponsorship) => (
                  <div
                    key={sp.id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 text-sm flex-shrink-0 shadow-sm">
                        {sp.sponsor?.name?.substring(0, 2).toUpperCase() || 'SP'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900">
                            {sp.sponsor?.name}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({sp.sponsor?.businessCategory})
                          </span>
                        </div>
                        {sp.message && (
                          <p className="text-xs text-slate-600 italic mt-1 bg-white p-2 rounded-xl border border-slate-100">
                            "{sp.message}"
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          Pledged on {new Date(sp.createdAt).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>

                    <div className="sm:text-right flex-shrink-0">
                      <div className="text-sm font-extrabold text-indigo-600">
                        {formatLKR(sp.amount)}
                      </div>
                      <div className="mt-1">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Funding Progress Summary Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Funding Progress
            </h3>

            <div>
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-500 font-medium">Goal Completion</span>
                <span className="text-slate-900 font-bold text-sm">
                  {event.fundingPercentage || 0}%
                </span>
              </div>
              <ProgressBar progress={event.fundingPercentage || 0} size="lg" showLabel={false} />
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Target Goal</span>
                <span className="font-semibold text-slate-800">
                  {formatLKR(event.targetBudget)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Accepted Funding</span>
                </span>
                <span className="font-bold text-emerald-600">
                  {formatLKR(event.fundedAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-1">
                  <Clock4 className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pending Pledges</span>
                </span>
                <span className="font-semibold text-amber-600">
                  {formatLKR(event.pendingAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Active Sponsors</span>
                <span className="font-bold text-slate-900">
                  {event.sponsorsCount || 0}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsPledgeModalOpen(true)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
              >
                <HandCoins className="w-4 h-4" />
                <span>Pledge Sponsorship (LKR)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PLEDGE MICRO-SPONSORSHIP MODAL */}
      <Modal
        isOpen={isPledgeModalOpen}
        onClose={() => setIsPledgeModalOpen(false)}
        title="Pledge Micro-Sponsorship"
        subtitle={`Record financial support for '${event.title}'`}
        maxWidth="md"
      >
        <form onSubmit={handlePledgeSubmit} className="space-y-4">
          {modalError && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {modalError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Sponsor *
            </label>
            <select
              value={selectedSponsorId}
              onChange={(e) => setSelectedSponsorId(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              {sponsors.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} — ({sp.businessCategory})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pledge Amount (LKR) *
            </label>
            <input
              type="number"
              required
              min="1000"
              step="500"
              placeholder="e.g. 15000"
              value={pledgeAmount}
              onChange={(e) => setPledgeAmount(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Message or Note from Sponsor (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Happy to support student innovation track prize..."
              value={pledgeMessage}
              onChange={(e) => setPledgeMessage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPledgeModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isSubmitting && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              <span>Submit Pledge</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
