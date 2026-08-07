export const AKSESARA_THEME = {
  colors: {
    primary: '#1d4ed8', // Accessible Blue (WCAG AA compliant)
    primaryHover: '#1e40af',
    verifiedBadgeBg: '#dcfce7',
    verifiedBadgeText: '#15803d',
    universalBadgeBg: '#fef3c7',
    universalBadgeText: '#b45309',
    highContrastBg: '#000000',
    highContrastText: '#ffff00',
    highContrastBorder: '#ffffff',
  },
  fontSize: {
    normal: '1rem',
    large: '1.25rem',
    extraLarge: '1.5rem',
  },
};

export interface AccessibilityPreferences {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  speechSpeed: number; // 0.8 to 1.5
}

export const DEFAULT_ACCESSIBILITY_PREFERENCES: AccessibilityPreferences = {
  textSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  soundEnabled: true,
  speechSpeed: 1.0,
};
