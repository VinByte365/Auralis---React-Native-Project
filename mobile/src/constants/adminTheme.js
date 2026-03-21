// Auralis Admin Theme — Centralized design tokens
export const COLORS = {
  // Primary
  primary: '#6366F1',
  primaryLight: '#A5B4FC',
  primaryDark: '#4338CA',

  // Sidebar
  sidebarBg: '#0F172A',
  sidebarActive: '#1E293B',
  sidebarText: '#94A3B8',
  sidebarTextActive: '#F8FAFC',
  sidebarIcon: '#64748B',
  sidebarIconActive: '#6366F1',
  sidebarGroupText: '#475569',

  // Content area
  background: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceBorder: '#E2E8F0',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Accents
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  danger: '#EF4444',
  dangerLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Chart palette
  chart1: '#6366F1',
  chart2: '#10B981',
  chart3: '#F59E0B',
  chart4: '#EF4444',
  chart5: '#8B5CF6',
  chart6: '#EC4899',

  // Misc
  divider: '#E2E8F0',
  overlay: 'rgba(15, 23, 42, 0.5)',
  ripple: 'rgba(99, 102, 241, 0.08)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const RADIUS = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 999,
};

export const FONT = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
  },
};
