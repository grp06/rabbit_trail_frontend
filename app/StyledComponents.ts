import styled, { css } from 'styled-components'
import {
  fadeIn,
  pulse,
  shimmer,
  scaleIn,
  slideInRight,
  bounce,
  glowPulse,
  durations,
  easings,
} from './animations'

// Extended Theme interface with design tokens
interface Theme {
  colors: {
    // Base colors
    background: string
    backgroundSecondary: string
    backgroundTertiary: string
    surface: string
    surfaceRaised: string
    surfaceInset: string

    // Text colors
    textPrimary: string
    textSecondary: string
    textTertiary: string
    textMuted: string

    // Accent colors
    accent: string
    accentHover: string
    accentGlow: string
    accentSubtle: string

    // Shadow colors for neumorphism
    shadowLight: string
    shadowDark: string
    shadowAmbient: string

    // Border colors
    border: string
    borderSubtle: string
  }

  // Design tokens
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    xxl: string
  }

  radii: {
    sm: string
    md: string
    lg: string
    xl: string
    round: string
  }

  shadows: {
    sm: string
    md: string
    lg: string
    xl: string
    insetSm: string
    insetMd: string
    insetLg: string
  }

  transitions: {
    default: string
    smooth: string
  }
}

// Extend themes with design tokens
const createTheme = (colors: Theme['colors']): Theme => ({
  colors,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  radii: {
    sm: '6px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    round: '50%',
  },
  shadows: {
    sm: `4px 4px 8px ${colors.shadowDark}, -4px -4px 8px ${colors.shadowLight}`,
    md: `8px 8px 16px ${colors.shadowDark}, -8px -8px 16px ${colors.shadowLight}`,
    lg: `12px 12px 24px ${colors.shadowDark}, -12px -12px 24px ${colors.shadowLight}`,
    xl: `16px 16px 32px ${colors.shadowDark}, -16px -16px 32px ${colors.shadowLight}`,
    insetSm: `inset 2px 2px 4px ${colors.shadowDark}, inset -2px -2px 4px ${colors.shadowLight}`,
    insetMd: `inset 6px 6px 12px ${colors.shadowDark}, inset -6px -6px 12px ${colors.shadowLight}`,
    insetLg: `inset 8px 8px 16px ${colors.shadowDark}, inset -8px -8px 16px ${colors.shadowLight}`,
  },
  transitions: {
    default: `all ${durations.normal} ${easings.easeOut}`,
    smooth: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
})

// Light theme
export const lightTheme = createTheme({
  background: '#FAFAFA',
  backgroundSecondary: '#F5F5F5',
  backgroundTertiary: '#EEEEEE',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceInset: '#F0F0F0',
  textPrimary: '#1A1A1A',
  textSecondary: '#404040',
  textTertiary: '#666666',
  textMuted: '#999999',
  accent: '#4A90E2',
  accentHover: '#357ABD',
  accentGlow: 'rgba(74, 144, 226, 0.15)',
  accentSubtle: 'rgba(74, 144, 226, 0.08)',
  shadowLight: 'rgba(255, 255, 255, 0.8)',
  shadowDark: 'rgba(0, 0, 0, 0.08)',
  shadowAmbient: 'rgba(0, 0, 0, 0.04)',
  border: '#E0E0E0',
  borderSubtle: 'rgba(0, 0, 0, 0.05)',
})

// Dark theme
export const darkTheme = createTheme({
  background: '#0A0A0B',
  backgroundSecondary: '#111113',
  backgroundTertiary: '#1A1A1D',
  surface: '#141416',
  surfaceRaised: '#1E1E21',
  surfaceInset: '#080809',
  textPrimary: '#FFFFFF',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0A0',
  textMuted: '#606060',
  accent: '#5DADE2',
  accentHover: '#3498DB',
  accentGlow: 'rgba(93, 173, 226, 0.12)',
  accentSubtle: 'rgba(93, 173, 226, 0.06)',
  shadowLight: 'rgba(255, 255, 255, 0.02)',
  shadowDark: 'rgba(0, 0, 0, 0.4)',
  shadowAmbient: 'rgba(0, 0, 0, 0.2)',
  border: '#2A2A2D',
  borderSubtle: 'rgba(255, 255, 255, 0.03)',
})

// Reusable mixins
const surfaceGradient = css<{ theme: Theme }>`
  background: linear-gradient(
    145deg,
    ${(props) => props.theme.colors.surfaceRaised},
    ${(props) => props.theme.colors.background}
  );
`

const insetGradient = css<{ theme: Theme }>`
  background: linear-gradient(
    145deg,
    ${(props) => props.theme.colors.surfaceInset},
    ${(props) => props.theme.colors.background}
  );
`

const neumorphic = css<{ theme: Theme; size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  ${surfaceGradient}
  box-shadow: ${(props) => props.theme.shadows[props.size || 'md']};
`

const neumorphicInset = css<{ theme: Theme; size?: 'sm' | 'md' | 'lg' }>`
  ${insetGradient}
  box-shadow: ${(props) =>
    props.theme.shadows[
      `inset${props.size?.charAt(0).toUpperCase()}${props.size?.slice(1)}` ||
        'insetMd'
    ]};
`

const smoothScrollbar = css<{ theme: Theme }>`
  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.border}
    ${(props) => props.theme.colors.surfaceInset};

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.surfaceInset};
    border-radius: ${(props) => props.theme.radii.sm};
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => props.theme.colors.border};
    border-radius: ${(props) => props.theme.radii.sm};
    transition: background ${durations.fast} ease;

    &:hover {
      background: ${(props) => props.theme.colors.textTertiary};
    }
  }
`

const textOptimization = css`
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
`

// Base components
const BaseButton = styled.button<{ theme: Theme }>`
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: ${(props) => props.theme.transitions.smooth};
  ${textOptimization}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`

const BaseCard = styled.div<{ theme: Theme; size?: 'sm' | 'md' | 'lg' | 'xl' }>`
  ${neumorphic}
  border-radius: ${(props) => props.theme.radii.lg};
  transition: ${(props) => props.theme.transitions.default};
`

// Main components
export const AppContainer = styled.div<{ theme: Theme }>`
  display: flex;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.background};
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: background ${durations.normal} ease;
`

export const Sidebar = styled.aside<{ $isVisible: boolean; theme: Theme }>`
  width: ${(props) => (props.$isVisible ? '320px' : '0')};
  ${surfaceGradient}
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-top: 80px;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: translateX(${(props) => (props.$isVisible ? '0' : '-20px')});
  box-shadow: inset 8px 0 16px ${(props) => props.theme.colors.shadowDark},
    inset -2px 0 8px ${(props) => props.theme.colors.shadowLight};
  ${smoothScrollbar}

  & > * {
    animation: ${(props) => (props.$isVisible ? fadeIn : 'none')}
      ${durations.normal} ${easings.easeOut} both;
    animation-delay: calc(var(--index, 0) * 50ms);
  }
`

export const MainContainer = styled.main<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12vh ${(props) => props.theme.spacing.xl}
    ${(props) => props.theme.spacing.xl};
  flex: 1;
  color: ${(props) => props.theme.colors.textSecondary};
  max-width: 100%;
`

export const InputContainer = styled(BaseCard)<{ theme: Theme }>`
  width: 90%;
  max-width: 800px;
  display: flex;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  padding: 4px;
  ${neumorphic}
  box-shadow: ${(props) => props.theme.shadows.lg},
    ${(props) => props.theme.shadows.insetSm};
`

export const CenteredInput = styled.input<{ theme: Theme }>`
  flex: 1;
  height: 48px;
  padding: 0 ${(props) => props.theme.spacing.lg};
  font-size: 16px;
  font-weight: 400;
  font-family: inherit;
  border: none;
  border-radius: ${(props) => props.theme.radii.md};
  outline: none;
  transition: ${(props) => props.theme.transitions.smooth};
  color: ${(props) => props.theme.colors.textPrimary};
  ${neumorphicInset}

  &::placeholder {
    color: ${(props) => props.theme.colors.textMuted};
    font-weight: 400;
  }

  &:focus {
    ${neumorphicInset}
    box-shadow: ${(props) => props.theme.shadows.insetLg},
      0 0 0 2px ${(props) => props.theme.colors.accentGlow};
    transform: scale(1.01);
  }

  &:hover:not(:focus) {
    ${insetGradient}
  }
`

export const Result = styled(BaseCard)<{ theme: Theme }>`
  text-align: left;
  font-size: 18px;
  margin: ${(props) => props.theme.spacing.md} 0;
  width: 90%;
  max-width: 800px;
  line-height: 1.7;
  color: ${(props) => props.theme.colors.textSecondary};
  padding: ${(props) => props.theme.spacing.xl};
  animation: ${fadeIn} ${durations.normal} ${easings.easeOut};
  border-radius: ${(props) => props.theme.radii.xl};
  ${textOptimization}
  word-spacing: 0.05em;
  letter-spacing: 0.01em;

  box-shadow: ${(props) => props.theme.shadows.xl},
    ${(props) => props.theme.shadows.insetSm};

  & * {
    font-size: inherit;
    line-height: inherit;
    font-family: inherit;
    font-weight: inherit;
  }
`

export const CurrentQuery = styled(BaseCard)<{ theme: Theme }>`
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.accent};
  margin: ${(props) => props.theme.spacing.xl} 0
    ${(props) => props.theme.spacing.md};
  width: 90%;
  max-width: 800px;
  line-height: 1.4;
  padding: ${(props) => props.theme.spacing.lg}
    ${(props) => props.theme.spacing.xl};
  animation: ${fadeIn} ${durations.normal} ${easings.easeOut};
  position: relative;

  box-shadow: ${(props) => props.theme.shadows.lg},
    ${(props) => props.theme.shadows.insetSm};

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(
      180deg,
      ${(props) => props.theme.colors.accent},
      ${(props) => props.theme.colors.accentHover}
    );
    border-radius: 2px 0 0 2px;
    box-shadow: 0 0 4px ${(props) => props.theme.colors.accentGlow};
  }
`

export const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.lg};
  width: 90%;
  max-width: 800px;
  margin: ${(props) => props.theme.spacing.xl} 0;
  padding: 0;
`

export const FollowUpButton = styled(BaseButton)<{ theme: Theme }>`
  padding: 1.25rem ${(props) => props.theme.spacing.lg};
  font-size: 15px;
  font-weight: 500;
  border-radius: ${(props) => props.theme.radii.lg};
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.4;
  text-align: left;
  position: relative;
  animation: ${scaleIn} ${durations.normal} ${easings.spring} both;
  animation-delay: calc(var(--index) * 50ms);
  ${neumorphic}

  box-shadow: ${(props) => props.theme.shadows.md},
    ${(props) => props.theme.shadows.insetSm};

  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
    ${surfaceGradient}
    transform: translateY(-2px) scale(1.02);
    box-shadow: ${(props) => props.theme.shadows.lg},
      ${(props) => props.theme.shadows.insetSm},
      0 0 12px ${(props) => props.theme.colors.accentSubtle};
  }

  &:active {
    transform: translateY(0) scale(0.98);
    box-shadow: ${(props) => props.theme.shadows.insetMd};
  }

  &::before {
    content: '';
    position: absolute;
    top: ${(props) => props.theme.spacing.md};
    right: ${(props) => props.theme.spacing.md};
    width: 6px;
    height: 6px;
    background: ${(props) => props.theme.colors.accent};
    border-radius: ${(props) => props.theme.radii.round};
    opacity: 0;
    transition: all 0.3s ease;
    transform: scale(0);
  }

  &:hover::before {
    opacity: 1;
    transform: scale(1);
    box-shadow: 0 0 8px ${(props) => props.theme.colors.accentGlow};
  }
`

export const ShuffleButton = styled(BaseButton)<{ theme: Theme }>`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  font-size: 14px;
  font-weight: 500;
  border-radius: ${(props) => props.theme.radii.md};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  min-width: 140px;
  color: ${(props) => props.theme.colors.textSecondary};
  ${neumorphic}

  box-shadow: ${(props) => props.theme.shadows.sm},
    ${(props) => props.theme.shadows.insetSm};

  &:hover:not(:disabled) {
    color: ${(props) => props.theme.colors.textPrimary};
    transform: translateY(-1px);
    ${surfaceGradient}
    box-shadow: ${(props) => props.theme.shadows.md},
      ${(props) => props.theme.shadows.insetSm},
      0 0 8px ${(props) => props.theme.colors.accentSubtle};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: ${(props) => props.theme.shadows.insetMd};
  }

  svg {
    transition: transform 0.3s ease;
    font-size: 12px;
  }

  &:hover:not(:disabled) svg {
    transform: rotate(180deg);
  }
`

export const HighlightedText = styled.span<{ theme: Theme }>`
  color: ${(props) => props.theme.colors.accent};
  text-decoration: none;
  cursor: pointer;
  padding: 0;
  border-radius: ${(props) => props.theme.radii.sm};
  transition: color ${durations.fast} ${easings.easeOut};
  position: relative;
  display: inline;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: ${(props) => props.theme.colors.accent};
    transition: width ${durations.fast} ${easings.easeOut};
  }

  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
    text-shadow: 0 0 4px ${(props) => props.theme.colors.accentGlow};

    &::after {
      width: 100%;
    }
  }

  &:active {
    opacity: 0.8;
  }
`

export const HistoryEntry = styled(BaseCard)<{ theme: Theme }>`
  margin: ${(props) => props.theme.spacing.sm};
  padding: ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.md};
  cursor: pointer;
  background: linear-gradient(
    145deg,
    ${(props) => props.theme.colors.background},
    ${(props) => props.theme.colors.surfaceInset}
  );
  box-shadow: ${(props) => props.theme.shadows.sm},
    ${(props) => props.theme.shadows.insetSm};

  &:hover {
    ${surfaceGradient}
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.sm},
      ${(props) => props.theme.shadows.insetSm};
  }
`

export const HistoryQuery = styled.div<{ theme: Theme }>`
  font-weight: 600;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  color: ${(props) => props.theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.3;
`

export const HistorySnippet = styled.div<{ theme: Theme }>`
  font-size: 13px;
  color: ${(props) => props.theme.colors.textTertiary};
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const RevertButton = styled(BaseButton)<{ theme: Theme }>`
  background: none;
  color: ${(props) => props.theme.colors.accent};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  font-size: 11px;
  font-weight: 500;
  margin-top: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    ${insetGradient}
    box-shadow: ${(props) => props.theme.shadows.insetSm};
    color: ${(props) => props.theme.colors.textPrimary};
  }

  &:active {
    color: ${(props) => props.theme.colors.accentHover};
  }
`

export const ConcisenessSidebar = styled(BaseCard)<{ theme: Theme }>`
  position: fixed;
  right: ${(props) => props.theme.spacing.lg};
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  padding: ${(props) => props.theme.spacing.lg}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.xl};
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.theme.colors.borderSubtle};

  box-shadow: ${(props) => props.theme.shadows.lg},
    ${(props) => props.theme.shadows.insetSm};
`

export const SliderContainer = styled.div`
  position: relative;
  height: 100px;
  width: 20px;
  margin: ${(props) => props.theme.spacing.md} 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SliderTrack = styled.div<{ theme: Theme }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 100%;
  border-radius: 3px;
  ${insetGradient}
  box-shadow: inset 3px 3px 6px ${(props) => props.theme.colors.shadowDark},
    inset -3px -3px 6px ${(props) => props.theme.colors.shadowLight};
`

export const SliderThumb = styled.div<{ $position: number; theme: Theme }>`
  position: absolute;
  top: ${(props) => props.$position}%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: ${(props) => props.theme.radii.round};
  cursor: grab;
  transition: ${(props) => props.theme.transitions.smooth};
  z-index: 10;
  background: linear-gradient(
    145deg,
    ${(props) => props.theme.colors.accent},
    ${(props) => props.theme.colors.accentHover}
  );
  box-shadow: ${(props) => props.theme.shadows.sm},
    inset 1px 1px 2px rgba(255, 255, 255, 0.15),
    inset -1px -1px 2px rgba(0, 0, 0, 0.2),
    0 0 12px ${(props) => props.theme.colors.accentGlow};

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: ${(props) => props.theme.shadows.sm},
      inset 2px 2px 4px rgba(255, 255, 255, 0.2),
      inset -2px -2px 4px rgba(0, 0, 0, 0.3),
      0 0 20px ${(props) => props.theme.colors.accentGlow};
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.95);
    cursor: grabbing;
  }
`

export const SliderLabel = styled.div<{ $isActive: boolean; theme: Theme }>`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) =>
    props.$isActive ? props.theme.colors.accent : props.theme.colors.textMuted};
  text-align: center;
  margin: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.md};
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.$isActive &&
    css`
      ${insetGradient}
      box-shadow: ${props.theme.shadows.insetSm};
      text-shadow: 0 0 6px ${props.theme.colors.accentGlow};
    `}

  &:hover {
    color: ${(props) =>
      props.$isActive
        ? props.theme.colors.accent
        : props.theme.colors.textSecondary};
    ${(props) =>
      !props.$isActive &&
      css`
        background: linear-gradient(
          145deg,
          ${props.theme.colors.background},
          ${props.theme.colors.surfaceInset}
        );
        box-shadow: ${props.theme.shadows.sm};
      `}
  }
`

export const SliderTitle = styled.div<{ theme: Theme }>`
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textTertiary};
  text-align: center;
  margin-bottom: ${(props) => props.theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 1px;
`

// Navigation Components
export const NavigationHeader = styled.header<{ theme: Theme }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.xl};
  ${surfaceGradient}
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${(props) => props.theme.colors.borderSubtle};
  box-shadow: 0 8px 32px ${(props) => props.theme.colors.shadowDark},
    0 -2px 8px ${(props) => props.theme.colors.shadowLight},
    inset 0 1px 2px ${(props) => props.theme.colors.shadowLight};
`

export const NavigationContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`

export const Logo = styled.h1<{ theme: Theme }>`
  font-size: 24px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${(props) => props.theme.colors.accent};
    text-shadow: 0 0 8px ${(props) => props.theme.colors.accentGlow};
  }
`

export const NavigationLinks = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
`

export const NavigationLink = styled(BaseButton)<{
  $isActive?: boolean
  theme: Theme
}>`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  font-size: 14px;
  font-weight: 500;
  border-radius: ${(props) => props.theme.radii.md};
  color: ${(props) =>
    props.$isActive
      ? props.theme.colors.accent
      : props.theme.colors.textSecondary};

  ${(props) =>
    props.$isActive
      ? css`
          ${insetGradient}
          box-shadow: ${props.theme.shadows.insetMd};
        `
      : css`
          ${surfaceGradient}
          box-shadow: ${props.theme.shadows.sm}, ${props.theme.shadows.insetSm};
        `}

  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
    ${surfaceGradient}
    transform: translateY(-1px);
    box-shadow: ${(props) => props.theme.shadows.md},
      ${(props) => props.theme.shadows.insetSm},
      0 0 8px ${(props) => props.theme.colors.accentSubtle};
  }

  &:active {
    transform: translateY(0);
    box-shadow: ${(props) => props.theme.shadows.insetMd};
  }
`

export const LoadingIndicator = styled.div<{ theme: Theme }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.md};
  ${insetGradient}
  box-shadow: ${(props) => props.theme.shadows.insetSm};
  animation: ${fadeIn} ${durations.fast} ${easings.easeOut};

  &::after {
    content: '';
    display: inline-block;
    animation: ${pulse} 1.4s ease-in-out infinite;
  }

  span {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: ${(props) => props.theme.radii.round};
    background: ${(props) => props.theme.colors.accent};
    animation: ${bounce} 1.4s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
`

export const StreamingIndicator = styled.span<{ theme: Theme }>`
  display: inline-block;
  width: 2px;
  height: 1em;
  background: ${(props) => props.theme.colors.accent};
  margin-left: 0.1em;
  animation: ${pulse} 1s ${easings.easeInOut} infinite;
  vertical-align: baseline;
  opacity: 0.8;
  line-height: 0;
  position: relative;
  top: 0.1em;
`

export const ThemeToggle = styled(BaseButton)<{ theme: Theme }>`
  position: fixed;
  bottom: ${(props) => props.theme.spacing.xl};
  right: ${(props) => props.theme.spacing.xl};
  width: 56px;
  height: 56px;
  border-radius: ${(props) => props.theme.radii.round};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  ${neumorphic}

  box-shadow: ${(props) => props.theme.shadows.md},
    ${(props) => props.theme.shadows.insetSm};

  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: ${(props) => props.theme.shadows.lg},
      ${(props) => props.theme.shadows.insetSm},
      0 0 16px ${(props) => props.theme.colors.accentSubtle};
  }

  &:active {
    transform: translateY(0) scale(0.95);
    box-shadow: ${(props) => props.theme.shadows.insetMd};
  }

  svg {
    width: 24px;
    height: 24px;
    color: ${(props) => props.theme.colors.accent};
    transition: all 0.3s ease;
  }

  &:hover svg {
    color: ${(props) => props.theme.colors.accentHover};
    filter: drop-shadow(0 0 6px ${(props) => props.theme.colors.accentGlow});
  }
`

export const ThemeIcon = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: rotate(${(props) => (props.$isVisible ? '0deg' : '180deg')});
  transition: all 0.3s ease;
`
