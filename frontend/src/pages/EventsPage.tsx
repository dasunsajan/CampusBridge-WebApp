import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Clock,
  Building,
  Edit2,
  Trash2,
  ExternalLink,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { eventApi } from '../services/api';
import { Event, EventCategory, EventStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const CATEGORIES: EventCategory[] = ['Technology', 'Cultural', 'Sports', 'Academic', 'Community'];
const STATUSES: EventStatus[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('eventDate');
  const [sortOrder, setSortOrder] = useState<string>('asc');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const initialFormData = {
    title: '',
    description: '',
    category: 'Technology',
    organizerName: '',
    eventDate: '',
    venue: '',
    targetBudget: '',
    status: 'UPCOMING' as EventStatus,
    imageUrl: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventApi.getAll({
        search,
        category: selectedCategory,
        status: selectedStatus,
        sortBy,
        sortOrder,
      });
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [search, selectedCategory, selectedStatus, sortBy, sortOrder]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    if (!formData.organizerName.trim()) {
      errors.organizerName = 'Organizer name is required';
    }
    if (!formData.eventDate) {
      errors.eventDate = 'Event date and time is required';
    }
    if (!formData.venue.trim()) {
      errors.venue = 'Venue location is required';
    }
    const budgetNum = Number(formData.targetBudget);
    if (!formData.targetBudget || isNaN(budgetNum) || budgetNum <= 0) {
      errors.targetBudget = 'Target budget must be a positive number';
    }
    if (formData.imageUrl && !formData.imageUrl.startsWith('http')) {
      errors.imageUrl = 'Image URL must start with http:// or https://';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Create
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await eventApi.create({
        ...formData,
        targetBudget: Number(formData.targetBudget),
        eventDate: new Date(formData.eventDate).toISOString(),
      });
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
      showSuccess('Event created successfully!');
      fetchEvents();
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to create event' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (event: Event) => {
    setSelectedEvent(event);
    const dateFormatted = new Date(event.eventDate).toISOString().slice(0, 16);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      organizerName: event.organizerName,
      eventDate: dateFormatted,
      venue: event.venue,
      targetBudget: String(event.targetBudget),
      status: event.status,
      imageUrl: event.imageUrl || '',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Handle Update
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !validateForm()) return;

    try {
      setIsSubmitting(true);
      await eventApi.update(selectedEvent.id, {
        ...formData,
        targetBudget: Number(formData.targetBudget),
        eventDate: new Date(formData.eventDate).toISOString(),
      });
      setIsEditModalOpen(false);
      setSelectedEvent(null);
      showSuccess('Event updated successfully!');
      fetchEvents();
    } catch (err: any) {
      setFormErrors({ submit: err.message || 'Failed to update event' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Delete Dialog
  const openDeleteDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteDialogOpen(true);
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!selectedEvent) return;

    try {
      setIsSubmitting(true);
      await eventApi.delete(selectedEvent.id);
      setIsDeleteDialogOpen(false);
      setSelectedEvent(null);
      showSuccess(`Event '${selectedEvent.title}' was safely removed.`);
      fetchEvents();
    } catch (err: any) {
      setError(err.message || 'Failed to delete event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatLKR = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-600/20 text-sm font-medium animate-bounce">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Campus Events Management
          </h1>
          <p className="text-sm text-slate-500">
            Publish, edit, and track funding for student society events and workshops.
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
          <span>New Event</span>
        </button>
      </div>

      {/* Controls: Search, Filters, Sorting */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by name, venue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="ALL">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="eventDate">Sort by Date</option>
              <option value="createdAt">Sort by Created</option>
              <option value="targetBudget">Sort by Target Budget</option>
              <option value="title">Sort by Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              title={`Switch to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner message="Loading events..." />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No Campus Events Found"
          description="Try adjusting your search filters, or create a new student organization event."
          actionText="Create New Event"
          onAction={() => {
            setFormData(initialFormData);
            setIsCreateModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
            >
              {/* Event Image Banner */}
              <div className="h-44 relative bg-slate-900 overflow-hidden">
                <img
                  src={
                    event.imageUrl ||
                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
                
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <Badge variant="primary" size="sm">
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
                    size="sm"
                  >
                    {event.status}
                  </Badge>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-[11px] text-indigo-300 font-medium flex items-center space-x-1.5 mb-0.5">
                    <Building className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{event.organizerName}</span>
                  </p>
                  <h3 className="text-white font-bold text-base leading-snug line-clamp-1">
                    {event.title}
                  </h3>
                </div>
              </div>

              {/* Event Details Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span>{new Date(event.eventDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>

                {/* Micro-Sponsorship Progress */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
                    <span className="text-slate-600">
                      Funded: <strong className="text-emerald-600">{formatLKR(event.fundedAmount || 0)}</strong>
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Target: {formatLKR(event.targetBudget)}
                    </span>
                  </div>
                  <ProgressBar progress={event.fundingPercentage || 0} size="sm" />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.sponsorsCount || 0} active sponsor(s)</span>
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {event.fundingPercentage || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/events/${event.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Details & Sponsors</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(event)}
                    title="Edit Event"
                    className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openDeleteDialog(event)}
                    title="Delete Event"
                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Campus Event"
        subtitle="Fill in event details to invite alumni and businesses for micro-sponsorship."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formErrors.submit && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {formErrors.submit}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HackX 2026 - Inter-University Hackathon"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                formErrors.title ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
            />
            {formErrors.title && <p className="text-[11px] text-rose-600 mt-1">{formErrors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide event details, objectives, and why sponsors should support it..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                formErrors.description ? 'border-rose-400 ring-1 ring-rose-400' : 'border-slate-200'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500`}
            />
            {formErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organizer Organization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rotaract Club of UoM / IEEE Branch"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.organizerName && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.organizerName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Budget (LKR) *
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                placeholder="e.g. 250000"
                value={formData.targetBudget}
                onChange={(e) => setFormData({ ...formData, targetBudget: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.targetBudget && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.targetBudget}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.eventDate && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.eventDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Civil Auditorium, University of Moratuwa"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {formErrors.venue && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.venue}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            {formErrors.imageUrl && (
              <p className="text-[11px] text-rose-600 mt-1">{formErrors.imageUrl}</p>
            )}
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
              <span>Save Event</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT EVENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Campus Event"
        subtitle="Update event details, target budget, or scheduling."
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formErrors.submit && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
              {formErrors.submit}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organizer Organization *
              </label>
              <input
                type="text"
                required
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Budget (LKR) *
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                value={formData.targetBudget}
                onChange={(e) => setFormData({ ...formData, targetBudget: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Venue *
              </label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
              <span>Update Changes</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Safe Event Deletion"
        message={`Are you sure you want to permanently delete '${selectedEvent?.title}'? According to database foreign key rules, all linked sponsorship pledge records for this event will also be removed.`}
        confirmText="Delete Event"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
