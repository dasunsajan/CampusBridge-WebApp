import React, { useEffect, useState } from 'react';
import {
  HandCoins,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Clock4,
  Trash2,
  Calendar,
  Building2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { sponsorshipApi, eventApi, sponsorApi } from '../services/api';
import { Sponsorship, Event, Sponsor, SponsorshipStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SponsorshipsPage: React.FC = () => {
  const [sponsorships, setSponsorships] = useState<Sponsorship[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Status Filter
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPledge, setSelectedPledge] = useState<Sponsorship | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    eventId: '',
    sponsorId: '',
    amount: '',
    message: '',
    status: 'PENDING' as SponsorshipStatus,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [pledgesData, eventsData, sponsorsData] = await Promise.all([
        sponsorshipApi.getAll({ status: selectedStatus }),
        eventApi.getAll(),
        sponsorApi.getAll(),
      ]);
      setSponsorships(pledgesData);
      setEvents(eventsData);
      setSponsors(sponsorsData);

      // Pre-select first event and sponsor in form if empty
      if (eventsData.length > 0 && !formData.eventId) {
        setFormData((prev) => ({ ...prev, eventId: eventsData[0].id }));
      }
      if (sponsorsData.length > 0 && !formData.sponsorId) {
        setFormData((prev) => ({ ...prev, sponsorId: sponsorsData[0].id }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load micro-sponsorship records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // Status update
  const handleStatusChange = async (
    id: string,
    newStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  ) => {
    try {
      await sponsorshipApi.updateStatus(id, newStatus);
      showSuccess(`Pledge status updated to ${newStatus}!`);
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update pledge status');
    }
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.eventId) errors.eventId = 'Please select an event';
    if (!formData.sponsorId) errors.sponsorId = 'Please select a sponsor';
    const amountNum = Number(formData.amount);
    if (!formData.amount || isNaN(amountNum) || amountNum <= 0) {
      errors.amount = 'Pledge amount must be a positive number';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await sponsorshipApi.create({
        ...formData,
        amount: Number(formData.amount),
      });
      setIsCreateModalOpen(false);
      setFormData({
        eventId: events[0]?.id || '',
        sponsorId: sponsors[0]?.id || '',
        amount: '',
        message: '',
        status: 'PENDING',
      });
      showSuccess('Micro-sponsorship pledge recorded successfully!');
      fetchData();
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to record pledge' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const openDeleteDialog = (pledge: Sponsorship) => {
    setSelectedPledge(pledge);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPledge) return;

    try {
      setIsSubmitting(true);
      await sponsorshipApi.delete(selectedPledge.id);
      setIsDeleteDialogOpen(false);
      setSelectedPledge(null);
      showSuccess('Sponsorship pledge safely deleted.');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete pledge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLKR = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`;

  // Totals
  const totalAccepted = sponsorships
    .filter((s) => s.status === 'ACCEPTED')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPending = sponsorships
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl text-sm font-medium animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Micro-Sponsorship Management
          </h1>
          <p className="text-sm text-slate-500">
            Record, review, and approve micro-sponsorship financial pledges from registered sponsors.
          </p>
        </div>
        <button
          onClick={() => {
            setFormErrors({});
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Pledge</span>
        </button>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Total Pledges</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{sponsorships.length}</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <HandCoins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Accepted Funding</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">{formatLKR(totalAccepted)}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Pending Review</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{formatLKR(totalPending)}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock4 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-1 overflow-x-auto">
        {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedStatus === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? 'All Pledges' : st}
          </button>
        ))}
      </div>

      {/* Pledges Table / Ledger */}
      {loading ? (
        <LoadingSpinner message="Loading sponsorship ledger..." />
      ) : sponsorships.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="No Sponsorship Pledges Found"
          description="Create a micro-sponsorship pledge to link a sponsor with a campus event."
          actionText="Record Pledge"
          onAction={() => setIsCreateModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Event</th>
                  <th className="py-3.5 px-4">Sponsor</th>
                  <th className="py-3.5 px-4">Pledge Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date & Message</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sponsorships.map((sp) => (
                  <tr key={sp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Event info */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{sp.event?.title}</div>
                      <div className="text-[11px] text-slate-400">
                        Target Budget: {formatLKR(sp.event?.targetBudget || 0)}
                      </div>
                    </td>

                    {/* Sponsor info */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{sp.sponsor?.name}</div>
                      <div className="text-[11px] text-indigo-600">
                        {sp.sponsor?.businessCategory}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatLKR(sp.amount)}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
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
                    </td>

                    {/* Date & Note */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-400 text-[10px]">
                        {new Date(sp.createdAt).toLocaleDateString('en-GB')}
                      </div>
                      {sp.message && (
                        <div className="text-slate-600 italic line-clamp-1 mt-0.5">
                          "{sp.message}"
                        </div>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {sp.status !== 'ACCEPTED' && (
                          <button
                            onClick={() => handleStatusChange(sp.id, 'ACCEPTED')}
                            title="Accept Pledge (Adds to Event Funded Total)"
                            className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {sp.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(sp.id, 'REJECTED')}
                            title="Reject Pledge (Does Not Add to Funded Total)"
                            className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {sp.status !== 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(sp.id, 'PENDING')}
                            title="Reset to Pending"
                            className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                          >
                            <Clock4 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => openDeleteDialog(sp)}
                          title="Delete Pledge Record"
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE PLEDGE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Record Micro-Sponsorship Pledge"
        subtitle="Link a registered sponsor to a campus event with a financial pledge."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formErrors.submit && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {formErrors.submit}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Campus Event *
            </label>
            <select
              value={formData.eventId}
              onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} (Goal: {formatLKR(ev.targetBudget)})
                </option>
              ))}
            </select>
            {formErrors.eventId && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.eventId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Sponsor *
            </label>
            <select
              value={formData.sponsorId}
              onChange={(e) => setFormData({ ...formData, sponsorId: e.target.value })}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {sponsors.map((sp) => (
                <option key={sp.id} value={sp.id}>
                  {sp.name} — {sp.businessCategory}
                </option>
              ))}
            </select>
            {formErrors.sponsorId && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.sponsorId}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pledge Amount (LKR) *
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                placeholder="e.g. 25000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.amount && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.amount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pledge Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as SponsorshipStatus })
                }
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sponsorship Message / Note (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. CSR grant for student workshops and equipment..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
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
              <span>Record Pledge</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Sponsorship Pledge"
        message={`Are you sure you want to delete this pledge of ${formatLKR(
          selectedPledge?.amount || 0
        )}? If accepted, the event's funded total will be reduced accordingly.`}
        confirmText="Delete Pledge"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
