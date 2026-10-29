import React, { useEffect, useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  Briefcase,
  Edit2,
  Trash2,
  CheckCircle2,
  HandCoins,
} from 'lucide-react';
import { sponsorApi } from '../services/api';
import { Sponsor } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const BUSINESS_CATEGORIES = [
  'Software & IT',
  'Food & Beverage',
  'Engineering & Tech',
  'Banking & Finance',
  'Alumni',
  'Retail & Apparel',
  'Other',
];

export const SponsorsPage: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    businessCategory: 'Software & IT',
    logoUrl: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sponsorApi.getAll({
        search,
        category: selectedCategory,
      });
      setSponsors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sponsors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, [search, selectedCategory]);

  const showSuccess = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Valid email is required';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = 'Valid phone number is required';
    }
    if (formData.logoUrl && !formData.logoUrl.startsWith('http')) {
      errors.logoUrl = 'Logo URL must start with http:// or https://';
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
      await sponsorApi.create(formData);
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
      showSuccess('Sponsor registered successfully!');
      fetchSponsors();
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to create sponsor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit
  const openEditModal = (sp: Sponsor) => {
    setSelectedSponsor(sp);
    setFormData({
      name: sp.name,
      email: sp.email,
      phone: sp.phone,
      businessCategory: sp.businessCategory,
      logoUrl: sp.logoUrl || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsor || !validateForm()) return;

    try {
      setIsSubmitting(true);
      await sponsorApi.update(selectedSponsor.id, formData);
      setIsEditModalOpen(false);
      setSelectedSponsor(null);
      showSuccess('Sponsor updated successfully!');
      fetchSponsors();
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to update sponsor' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const openDeleteDialog = (sp: Sponsor) => {
    setSelectedSponsor(sp);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSponsor) return;

    try {
      setIsSubmitting(true);
      await sponsorApi.delete(selectedSponsor.id);
      setIsDeleteDialogOpen(false);
      setSelectedSponsor(null);
      showSuccess(`Sponsor '${selectedSponsor.name}' removed successfully.`);
      fetchSponsors();
    } catch (err: any) {
      setError(err.message || 'Failed to delete sponsor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLKR = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`;

  return (
    <div className="space-y-6">
      {/* Toast */}
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
            Sponsors Directory
          </h1>
          <p className="text-sm text-slate-500">
            Alumni, local businesses, and enterprise partners supporting campus events.
          </p>
        </div>
        <button
          onClick={() => {
            setFormData(initialFormData);
            setFormErrors({});
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Register Sponsor</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search sponsor by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="ALL">All Business Categories</option>
            {BUSINESS_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sponsors Grid */}
      {loading ? (
        <LoadingSpinner message="Loading sponsors..." />
      ) : sponsors.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Sponsors Found"
          description="Register a new alumnus or local business partner to start receiving pledges."
          actionText="Register Sponsor"
          onAction={() => {
            setFormData(initialFormData);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sp) => (
            <div
              key={sp.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-base flex items-center justify-center border border-indigo-100 flex-shrink-0">
                      {sp.logoUrl ? (
                        <img
                          src={sp.logoUrl}
                          alt={sp.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        sp.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{sp.name}</h3>
                      <Badge variant="info" size="sm" className="mt-1">
                        {sp.businessCategory}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(sp)}
                      title="Edit Sponsor"
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteDialog(sp)}
                      title="Delete Sponsor"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{sp.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{sp.phone}</span>
                  </div>
                </div>

                {/* Contribution Metrics */}
                <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Accepted Contributions:</span>
                    <span className="font-bold text-emerald-600">
                      {formatLKR(sp.totalContributed || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Supported Events:</span>
                    <span className="font-semibold text-slate-700">
                      {sp.supportedEventsCount || 0} event(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-[11px] text-slate-400">
                Registered on {new Date(sp.createdAt).toLocaleDateString('en-GB')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SPONSOR MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Register New Sponsor"
        subtitle="Add a business partner or alumni sponsor profile."
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
              Sponsor / Business Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ceylon Cloud Solutions"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Category *
            </label>
            <select
              value={formData.businessCategory}
              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                placeholder="contact@company.lk"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.email && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+94 11 234 5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.phone && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Logo URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
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
              <span>Save Sponsor</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT SPONSOR MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Sponsor Profile"
        subtitle="Update contact info or business category."
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sponsor Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Category *
            </label>
            <select
              value={formData.businessCategory}
              onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
            >
              {BUSINESS_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Logo URL (Optional)
            </label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Sponsor Deletion"
        message={`Are you sure you want to delete '${selectedSponsor?.name}'? Their pledge history will also be removed.`}
        confirmText="Delete Sponsor"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
