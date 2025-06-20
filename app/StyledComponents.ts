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

// Extended Theme interface following neumorphic design principles
interface Theme {
  colors: {
    // Single material principle - base colors
    base: string
    baseLight: string
    baseDark: string

    // Surface colors (same as base for single material)
    surface: string
    surfaceRaised: string
    surfaceInset: string

    // Text colors with proper contrast
    textPrimary: string
    textSecondary: string
    textTertiary: string
    textMuted: string

    // Accent colors (for icons/glyphs only, not surfaces)
    accent: string
    accentHover: string
    accentGlow: string
    accentSubtle: string

    // Neumorphic shadow colors
    shadowLight: string
    shadowDark: string
    shadowAmbient: string

    // Border colors
    border: string
    borderSubtle: string
  }

  // CSS custom properties for neumorphic design
  neumorphic: {
    depth: string
    radius: string
    blur: string
    spread: string
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
    neu: string
    neuHover: string
    neuPressed: string
    neuInset: string
    neuInsetDeep: string
  }

  transitions: {
    default: string
    smooth: string
  }
}

// Create neumorphic theme following the guide's principles
const createNeumorphicTheme = (
  baseColor: string,
  shadowLight: string,
  shadowDark: string,
  textPrimary: string,
  textSecondary: string,
  accent: string
): Theme => ({
  colors: {
    // Single material principle - all surfaces use the same base color
    base: baseColor,
    baseLight: baseColor,
    baseDark: baseColor,

    surface: baseColor,
    surfaceRaised: baseColor,
    surfaceInset: baseColor,

    textPrimary,
    textSecondary,
    textTertiary: textSecondary,
    textMuted: shadowDark.replace('0.15', '0.4'),

    accent,
    accentHover: accent,
    accentGlow: accent.replace(')', ', 0.08)').replace('rgb', 'rgba'),
    accentSubtle: accent.replace(')', ', 0.05)').replace('rgb', 'rgba'),

    shadowLight,
    shadowDark,
    shadowAmbient: shadowDark.replace('0.15', '0.05'),

    border: shadowDark.replace('0.15', '0.1'),
    borderSubtle: shadowDark.replace('0.15', '0.05'),
  },

  neumorphic: {
    depth: '6px',
    radius: '16px',
    blur: '16px',
    spread: '0px',
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.75rem', // Increased spacing following guide
    md: '1.5rem', // 1.5x Material Design spacing
    lg: '2.25rem', // 1.5x Material Design spacing
    xl: '3rem', // 2x Material Design spacing
    xxl: '4.5rem', // 2x Material Design spacing
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px', // Within 12-20px range recommended
    xl: '20px', // Within 12-20px range recommended
    round: '50%',
  },

  shadows: {
    // Twin shadows following the guide's formula
    neu: `6px 6px 16px ${shadowDark}, -6px -6px 16px ${shadowLight}`,
    neuHover: `8px 8px 20px ${shadowDark}, -8px -8px 20px ${shadowLight}`,
    neuPressed: `inset 6px 6px 12px ${shadowDark}, inset -6px -6px 12px ${shadowLight}`,
    neuInset: `inset 3px 3px 8px ${shadowDark}, inset -3px -3px 8px ${shadowLight}`,
    neuInsetDeep: `inset 8px 8px 16px ${shadowDark}, inset -8px -8px 16px ${shadowLight}`,
  },

  transitions: {
    default: `all ${durations.normal} ${easings.easeOut}`,
    smooth: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`,
  },
})

// Light theme following guide's recommendations
export const lightTheme = createNeumorphicTheme(
  '#E0E5EC', // Recommended base color from guide
  'rgba(255, 255, 255, 0.6)', // Light shadow exactly as specified
  'rgba(0, 0, 0, 0.15)', // Dark shadow exactly as specified
  '#2C3E50', // High contrast text (4.5:1 ratio)
  '#5A6B7D', // Secondary text with good contrast
  '#4A90E2' // Accent color for icons/glyphs only
)

// Dark theme following guide's color-math approach
export const darkTheme = createNeumorphicTheme(
  '#1E2126', // Lightened from #15171C for better visibility
  'rgba(255, 255, 255, 0.05)', // Slightly increased light shadow
  'rgba(0, 0, 0, 0.3)', // Reduced dark shadow intensity
  '#FFFFFF', // White text for contrast
  '#B8BCC8', // Muted secondary text
  '#5DADE2' // Slightly brighter accent for dark theme
)

// Neumorphic mixins following the guide's principles
const neumorphicBase = css<{ theme: Theme }>`
  background: ${(props) => props.theme.colors.base};
  border-radius: ${(props) => props.theme.neumorphic.radius};
  box-shadow: ${(props) => props.theme.shadows.neu};
  transition: ${(props) => props.theme.transitions.smooth};
  border: none;
`

const neumorphicHover = css<{ theme: Theme }>`
  &:hover:not(:disabled) {
    box-shadow: ${(props) => props.theme.shadows.neuHover};
    transform: translateY(-1px);
    filter: brightness(1.02);
  }
`

const neumorphicPressed = css<{ theme: Theme }>`
  &:active:not(:disabled),
  &[aria-pressed='true'] {
    box-shadow: ${(props) => props.theme.shadows.neuPressed};
    transform: translateY(0);
    filter: brightness(0.98);
  }
`

const neumorphicInset = css<{ theme: Theme }>`
  background: ${(props) => props.theme.colors.base};
  box-shadow: ${(props) => props.theme.shadows.neuInset};
  border-radius: ${(props) => props.theme.radii.md};
`

const neumorphicInsetDeep = css<{ theme: Theme }>`
  background: ${(props) => props.theme.colors.base};
  box-shadow: ${(props) => props.theme.shadows.neuInsetDeep};
  border-radius: ${(props) => props.theme.radii.md};
`

const smoothScrollbar = css<{ theme: Theme }>`
  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.border}
    ${(props) => props.theme.colors.base};

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => props.theme.colors.base};
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

// Base components following neumorphic principles
const BaseButton = styled.button<{ theme: Theme }>`
  ${neumorphicBase}
  ${neumorphicHover}
  ${neumorphicPressed}
  cursor: pointer;
  font-family: inherit;
  color: ${(props) => props.theme.colors.textSecondary};
  ${textOptimization}

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: ${(props) => props.theme.shadows.neu};
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.accent};
    outline-offset: 2px;
  }
`

const BaseCard = styled.div<{ theme: Theme }>`
  ${neumorphicBase}
  ${textOptimization}
`

// Main components
export const AppContainer = styled.div<{ theme: Theme }>`
  display: flex;
  min-height: 100vh;
  background: ${(props) => props.theme.colors.base};
  font-family: var(--font-space-grotesk), 'Comic Sans MS', 'Comic Sans', cursive,
    -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  transition: background ${durations.normal} ease;
  ${textOptimization}
`

export const Sidebar = styled.aside<{ $isVisible: boolean; theme: Theme }>`
  width: ${(props) => (props.$isVisible ? '320px' : '0')};
  background: ${(props) => props.theme.colors.base};
  overflow-y: auto;
  overflow-x: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  margin-top: 60px;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transform: translateX(${(props) => (props.$isVisible ? '0' : '-20px')});
  ${neumorphicInsetDeep}
  ${smoothScrollbar}

  & > * {
    animation: ${(props) => (props.$isVisible ? fadeIn : 'none')}
      ${durations.normal} ${easings.easeOut} both;
    animation-delay: calc(var(--index, 0) * 50ms);
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    height: calc(100vh - 60px);
    z-index: 1500;
    width: ${(props) => (props.$isVisible ? '280px' : '0')};
    margin-top: 0;
  }
`

export const MainContainer = styled.main<{ theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8vh ${(props) => props.theme.spacing.xl}
    ${(props) => props.theme.spacing.lg};
  flex: 1;
  color: ${(props) => props.theme.colors.textSecondary};
  max-width: 100%;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: calc(60px + ${(props) => props.theme.spacing.md})
      ${(props) => props.theme.spacing.sm} ${(props) => props.theme.spacing.sm};
  }
`

export const InputContainer = styled(BaseCard)<{ theme: Theme }>`
  width: 90%;
  max-width: 800px;
  display: flex;
  align-items: center;
  margin-bottom: ${(props) => props.theme.spacing.lg};
  padding: 4px;

  @media (max-width: 768px) {
    width: 95%;
    margin-bottom: ${(props) => props.theme.spacing.sm};
  }
`

export const CenteredInput = styled.input<{ theme: Theme }>`
  flex: 1;
  height: 48px;
  padding: 0 ${(props) => props.theme.spacing.lg};
  font-size: 16px;
  font-weight: 400;
  font-family: inherit;
  border: none;
  outline: none;
  transition: ${(props) => props.theme.transitions.smooth};
  color: ${(props) => props.theme.colors.textPrimary};
  ${neumorphicInset}
  ${textOptimization}

  // Enhanced visibility for input field
  background: ${(props) =>
    props.theme.colors.base === '#1E2126'
      ? '#252A30' // Slightly lighter background for dark theme input
      : props.theme.colors.base};

  &::placeholder {
    color: ${(props) =>
      props.theme.colors.base === '#1E2126'
        ? 'rgba(255, 255, 255, 0.5)' // Light placeholder for dark theme
        : props.theme.colors.textMuted};
    font-weight: 400;
  }

  &:focus {
    box-shadow: ${(props) => props.theme.shadows.neuInsetDeep},
      0 0 0 2px ${(props) => props.theme.colors.accentGlow};
    transform: scale(1.005);
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
  word-spacing: 0.05em;
  letter-spacing: 0.01em;

  & * {
    font-size: inherit;
    line-height: inherit;
    font-family: inherit;
    font-weight: inherit;
  }

  @media (max-width: 768px) {
    width: 95%;
    font-size: 16px;
    padding: ${(props) => props.theme.spacing.md};
    margin: ${(props) => props.theme.spacing.xs} 0;
    line-height: 1.6;
  }
`

export const CurrentQuery = styled(BaseCard)<{ theme: Theme }>`
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.accent};
  margin: ${(props) => props.theme.spacing.lg} 0
    ${(props) => props.theme.spacing.sm};
  width: 90%;
  max-width: 800px;
  line-height: 1.4;
  padding: ${(props) => props.theme.spacing.md}
    ${(props) => props.theme.spacing.lg};
  animation: ${fadeIn} ${durations.normal} ${easings.easeOut};
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${(props) => props.theme.colors.accent};
    border-radius: 2px 0 0 2px;
    box-shadow: 0 0 4px ${(props) => props.theme.colors.accentGlow};
  }

  @media (max-width: 768px) {
    width: 95%;
    font-size: 18px;
    margin: ${(props) => props.theme.spacing.sm} 0
      ${(props) => props.theme.spacing.xs};
    padding: ${(props) => props.theme.spacing.sm}
      ${(props) => props.theme.spacing.md};
  }
`

export const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${(props) => props.theme.spacing.md};
  width: 90%;
  max-width: 800px;
  margin: ${(props) => props.theme.spacing.lg} 0;
  padding: 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    width: 95%;
    gap: ${(props) => props.theme.spacing.xs};
    margin: ${(props) => props.theme.spacing.sm} 0;
  }
`

export const FollowUpButton = styled(BaseButton)<{ theme: Theme }>`
  padding: 1.25rem ${(props) => props.theme.spacing.lg};
  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  text-align: left;
  position: relative;
  animation: ${scaleIn} ${durations.normal} ${easings.spring} both;
  animation-delay: calc(var(--index) * 50ms);

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
    box-shadow: 0 0 4px ${(props) => props.theme.colors.accentGlow};
  }

  @media (max-width: 768px) {
    padding: 1rem ${(props) => props.theme.spacing.md};
    font-size: 14px;
  }
`

export const ShuffleButton = styled(BaseButton)<{ theme: Theme }>`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.spacing.sm};
  min-width: 140px;

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
  cursor: pointer;
  ${neumorphicHover}
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
  background: ${(props) => props.theme.colors.base};
  color: ${(props) => props.theme.colors.accent};
  padding: ${(props) => props.theme.spacing.xs}
    ${(props) => props.theme.spacing.sm};
  font-size: 11px;
  font-weight: 500;
  margin-top: ${(props) => props.theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: ${(props) => props.theme.shadows.neuInset};

  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
    box-shadow: ${(props) => props.theme.shadows.neuPressed};
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
  backdrop-filter: blur(10px);
  border: 1px solid ${(props) => props.theme.colors.borderSubtle};

  @media (max-width: 768px) {
    display: none;
  }
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

  @media (max-width: 768px) {
    height: 20px;
    width: 100px;
    margin: 0 ${(props) => props.theme.spacing.md};
  }
`

export const SliderTrack = styled.div<{ theme: Theme }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 100%;
  border-radius: 3px;
  ${neumorphicInset}

  @media (max-width: 768px) {
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    width: 100%;
    height: 6px;
  }
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
  background: ${(props) => props.theme.colors.accent};
  box-shadow: ${(props) => props.theme.shadows.neu},
    0 0 6px ${(props) => props.theme.colors.accentGlow};

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: ${(props) => props.theme.shadows.neuHover},
      0 0 10px ${(props) => props.theme.colors.accentGlow};
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.95);
    cursor: grabbing;
    box-shadow: ${(props) => props.theme.shadows.neuPressed};
  }

  @media (max-width: 768px) {
    top: 50%;
    left: ${(props) => props.$position}%;
    transform: translate(-50%, -50%);
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
  padding: ${(props) => props.theme.spacing.sm};
  border-radius: ${(props) => props.theme.radii.md};
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.$isActive &&
    css`
      background: ${props.theme.colors.base};
      box-shadow: ${props.theme.shadows.neuInset};
      text-shadow: 0 0 3px ${props.theme.colors.accentGlow};
    `}

  &:hover {
    color: ${(props) =>
      props.$isActive
        ? props.theme.colors.accent
        : props.theme.colors.textSecondary};
    ${(props) =>
      !props.$isActive &&
      css`
        background: ${props.theme.colors.base};
        box-shadow: ${props.theme.shadows.neu};
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
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  background: ${(props) => props.theme.colors.base};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${(props) => props.theme.colors.borderSubtle};
  box-shadow: ${(props) => props.theme.shadows.neu};

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing.sm}
      ${(props) => props.theme.spacing.md};
  }
`

export const NavigationContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`

export const Logo = styled.h1<{ theme: Theme }>`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${(props) => props.theme.colors.accent};
    text-shadow: 0 0 4px ${(props) => props.theme.colors.accentGlow};
  }
`

export const NavigationLinks = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing.md};
  align-items: center;
`

export const MobileMenuButton = styled(BaseButton)<{ theme: Theme }>`
  display: none;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    display: flex;
  }
`

export const NavigationLink = styled(BaseButton)<{
  $isActive?: boolean
  theme: Theme
}>`
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.lg};
  font-size: 14px;
  font-weight: 500;
  color: ${(props) =>
    props.$isActive
      ? props.theme.colors.accent
      : props.theme.colors.textSecondary};

  ${(props) =>
    props.$isActive &&
    css`
      box-shadow: ${props.theme.shadows.neuPressed};
    `}
`

export const LoadingIndicator = styled.div<{ theme: Theme }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  border-radius: ${(props) => props.theme.radii.md};
  background: ${(props) => props.theme.colors.base};
  box-shadow: ${(props) => props.theme.shadows.neuInset};
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

  svg {
    width: 24px;
    height: 24px;
    color: ${(props) => props.theme.colors.accent};
    transition: all 0.3s ease;
  }

  &:hover svg {
    color: ${(props) => props.theme.colors.accentHover};
    filter: drop-shadow(0 0 3px ${(props) => props.theme.colors.accentGlow});
  }

  @media (max-width: 768px) {
    bottom: ${(props) => props.theme.spacing.lg};
    right: ${(props) => props.theme.spacing.lg};
    width: 48px;
    height: 48px;

    svg {
      width: 20px;
      height: 20px;
    }
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

// Modal Components
export const ModalOverlay = styled.div<{ $isVisible: boolean; theme: Theme }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  visibility: ${(props) => (props.$isVisible ? 'visible' : 'hidden')};
  transition: all ${durations.normal} ${easings.easeOut};
  padding: ${(props) => props.theme.spacing.lg};
`

export const MobileOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1400;
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  visibility: ${(props) => (props.$isVisible ? 'visible' : 'hidden')};
  transition: all 0.3s ease;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`

export const ModalContainer = styled.div<{ $isVisible: boolean; theme: Theme }>`
  max-width: 500px;
  width: 100%;
  ${neumorphicBase}
  padding: ${(props) => props.theme.spacing.xxl};
  position: relative;
  transform: ${(props) =>
    props.$isVisible
      ? 'scale(1) translateY(0)'
      : 'scale(0.9) translateY(20px)'};
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition: all ${durations.normal} ${easings.spring};
  transition-delay: ${(props) => (props.$isVisible ? '100ms' : '0ms')};
  animation: ${(props) => (props.$isVisible ? fadeIn : 'none')}
    ${durations.slow} ${easings.easeOut};

  @media (max-width: 768px) {
    max-width: 90%;
    padding: ${(props) => props.theme.spacing.xl};
  }
`

export const ModalCloseButton = styled(BaseButton)<{ theme: Theme }>`
  position: absolute;
  top: ${(props) => props.theme.spacing.lg};
  right: ${(props) => props.theme.spacing.lg};
  width: 40px;
  height: 40px;
  border-radius: ${(props) => props.theme.radii.round};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => props.theme.colors.textMuted};
  font-size: 18px;
  font-weight: 300;
`

export const ModalTitle = styled.h2<{ theme: Theme }>`
  font-size: 28px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.accent};
  margin: 0 0 ${(props) => props.theme.spacing.lg} 0;
  text-align: center;
  animation: ${fadeIn} ${durations.normal} ${easings.easeOut};
  animation-delay: 200ms;
  animation-fill-mode: both;
  text-shadow: 0 0 4px ${(props) => props.theme.colors.accentGlow};
`

export const ModalContent = styled.div<{ theme: Theme }>`
  color: ${(props) => props.theme.colors.textSecondary};
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: ${(props) => props.theme.spacing.xl};
  animation: ${fadeIn} ${durations.normal} ${easings.easeOut};
  animation-delay: 300ms;
  animation-fill-mode: both;
  ${textOptimization}
`

export const ModalFeatureList = styled.ul<{ theme: Theme }>`
  list-style: none;
  padding: 0;
  margin: ${(props) => props.theme.spacing.lg} 0;

  li {
    display: flex;
    align-items: center;
    margin-bottom: ${(props) => props.theme.spacing.sm};
    padding: ${(props) => props.theme.spacing.xs} 0;
    animation: ${slideInRight} ${durations.normal} ${easings.easeOut};
    animation-delay: calc(400ms + var(--index) * 100ms);
    animation-fill-mode: both;

    &::before {
      content: '✨';
      margin-right: ${(props) => props.theme.spacing.sm};
      font-size: 14px;
      opacity: 0.8;
    }

    @media (max-width: 768px) {
      margin-bottom: ${(props) => props.theme.spacing.xs};
      padding: 2px 0;

      &::before {
        margin-right: ${(props) => props.theme.spacing.xs};
        font-size: 12px;
      }
    }
  }

  @media (max-width: 768px) {
    margin: ${(props) => props.theme.spacing.md} 0;
  }
`

export const ModalButton = styled(BaseButton)<{ theme: Theme }>`
  width: 100%;
  padding: ${(props) => props.theme.spacing.lg};
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  background: ${(props) => props.theme.colors.accent};
  box-shadow: ${(props) => props.theme.shadows.neu};
  animation: ${scaleIn} ${durations.normal} ${easings.spring};
  animation-delay: 600ms;
  animation-fill-mode: both;

  &:hover {
    background: ${(props) => props.theme.colors.accentHover};
    box-shadow: ${(props) => props.theme.shadows.neuHover},
      0 0 10px ${(props) => props.theme.colors.accentGlow};
  }

  &:active {
    box-shadow: ${(props) => props.theme.shadows.neuPressed};
  }
`
