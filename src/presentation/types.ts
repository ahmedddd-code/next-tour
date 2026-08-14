import type { LucideIcon } from 'lucide-react';

export type VisualKind =
  | 'cover' | 'overview' | 'home' | 'search' | 'sync' | 'booking' | 'account'
  | 'ai' | 'mobile' | 'admin' | 'editor' | 'bookings' | 'support' | 'analytics'
  | 'security' | 'architecture' | 'compare' | 'roadmap' | 'final';

export type Slide = {
  eyebrow: string;
  title: string;
  lead: string;
  visual: VisualKind;
  points?: string[];
  metric?: string;
  metricLabel?: string;
  icon?: LucideIcon;
};
