export type EventCategory = 'Technology' | 'Cultural' | 'Sports' | 'Academic' | 'Community';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type SponsorshipStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  organizerName: string;
  eventDate: string;
  venue: string;
  targetBudget: number;
  status: EventStatus;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Computed metrics from API
  pledgedAmount?: number;
  fundedAmount?: number;
  pendingAmount?: number;
  fundingPercentage?: number;
  sponsorsCount?: number;
  totalPledgesCount?: number;
  
  sponsorships?: Sponsorship[];
}

export interface Sponsor {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessCategory: string;
  logoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  
  totalContributed?: number;
  pendingPledges?: number;
  supportedEventsCount?: number;
  sponsorships?: Sponsorship[];
}

export interface Sponsorship {
  id: string;
  eventId: string;
  sponsorId: string;
  amount: number;
  message?: string | null;
  status: SponsorshipStatus;
  createdAt: string;
  updatedAt: string;
  
  event?: {
    id: string;
    title: string;
    category?: string;
    targetBudget?: number;
    status?: string;
  };
  sponsor?: {
    id: string;
    name: string;
    email: string;
    businessCategory?: string;
    logoUrl?: string | null;
  };
}

export interface DashboardOverview {
  totalEvents: number;
  upcomingEvents: number;
  totalSponsors: number;
  totalPledged: number;
  totalAccepted: number;
  totalPending: number;
  pendingPledgesCount: number;
  acceptedPledgesCount: number;
  rejectedPledgesCount: number;
}

export interface DashboardData {
  overview: DashboardOverview;
  recentPledges: Sponsorship[];
  featuredEvents: Event[];
}

export interface AnalyticsData {
  eventsByCategory: { category: string; count: number }[];
  fundingPerEvent: { id: string; title: string; targetBudget: number; fundedAmount: number }[];
  statusBreakdown: { status: string; count: number; totalAmount: number }[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
  errors?: { field: string; message: string }[];
}
