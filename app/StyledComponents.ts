import styled from 'styled-components'

// Enhanced color palette for better neumorphic design
const colors = {
  // Base dark colors with slight cool tinting
  darkBase: '#1C1C1E', // Main background - slightly cool tinted
  darkRaised: '#252529', // Raised elements
  darkInset: '#171719', // Inset/pressed elements
  darkBorder: '#2C2C30', // Subtle borders

  // Text colors with better hierarchy
  textPrimary: '#FFFFFF',
  textSecondary: '#E5E5E7',
  textTertiary: '#8E8E93',
  textMuted: '#636366',

  // Accent color - electric blue
  accent: '#007AFF',
  accentHover: '#0056CC',
  accentGlow: 'rgba(0, 122, 255, 0.3)',

  // Shadow colors for consistent lighting (top-left light source)
  shadowLight: 'rgba(255, 255, 255, 0.04)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
  shadowAmbient: 'rgba(0, 0, 0, 0.3)',
}

export const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, ${colors.darkBase} 0%, #1a1a1c 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`

export const Sidebar = styled.aside<{ $isVisible: boolean }>`
  width: ${(props) => (props.$isVisible ? '320px' : '0')};
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;

  /* Neumorphic inset effect for sidebar */
  box-shadow: inset 8px 0 16px ${colors.shadowDark},
    inset -2px 0 8px ${colors.shadowLight};

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${colors.darkInset};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${colors.darkBorder};
    border-radius: 3px;

    &:hover {
      background: ${colors.textTertiary};
    }
  }
`

export const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12vh 2rem 2rem;
  flex: 1;
  color: ${colors.textSecondary};
  max-width: 100%;
`

export const InputContainer = styled.div`
  width: 90%;
  max-width: 800px;
  display: flex;
  align-items: center;
  margin-bottom: 2rem;

  /* Subtle neumorphic container */
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  border-radius: 16px;
  padding: 4px;
  box-shadow: 12px 12px 24px ${colors.shadowDark},
    -12px -12px 24px ${colors.shadowLight},
    inset 2px 2px 4px ${colors.shadowLight},
    inset -2px -2px 4px ${colors.shadowAmbient};
`

export const CenteredInput = styled.input`
  flex: 1;
  height: 48px;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 400;
  font-family: inherit;
  border: none;
  border-radius: 12px;
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${colors.textPrimary};

  /* Inset neumorphic effect for input */
  background: linear-gradient(145deg, ${colors.darkInset}, ${colors.darkBase});
  box-shadow: inset 6px 6px 12px ${colors.shadowDark},
    inset -6px -6px 12px ${colors.shadowLight};

  &::placeholder {
    color: ${colors.textMuted};
    font-weight: 400;
  }

  &:focus {
    background: linear-gradient(145deg, ${colors.darkInset}, #1a1a1c);
    box-shadow: inset 8px 8px 16px ${colors.shadowDark},
      inset -8px -8px 16px ${colors.shadowLight}, 0 0 0 2px ${colors.accentGlow};
    transform: scale(1.01);
  }

  &:hover:not(:focus) {
    background: linear-gradient(145deg, #191919, ${colors.darkBase});
  }
`

export const Result = styled.div`
  text-align: left;
  font-size: 18px;
  margin: 1rem 0;
  width: 90%;
  max-width: 800px;
  line-height: 1.7;
  color: ${colors.textSecondary};
  padding: 2rem;

  /* Subtle card effect */
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  border-radius: 20px;
  box-shadow: 16px 16px 32px ${colors.shadowDark},
    -16px -16px 32px ${colors.shadowLight},
    inset 2px 2px 4px ${colors.shadowLight},
    inset -2px -2px 4px rgba(0, 0, 0, 0.1);
`

export const CurrentQuery = styled.div`
  text-align: left;
  font-size: 20px;
  font-weight: 600;
  color: ${colors.accent};
  margin: 2rem 0 1rem;
  width: 90%;
  max-width: 800px;
  line-height: 1.4;
  padding: 1.5rem 2rem;

  /* Enhanced neumorphic card with accent */
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  border-radius: 16px;
  position: relative;

  /* Main neumorphic shadows */
  box-shadow: 12px 12px 24px ${colors.shadowDark},
    -12px -12px 24px ${colors.shadowLight},
    inset 2px 2px 4px ${colors.shadowLight},
    inset -2px -2px 4px rgba(0, 0, 0, 0.2);

  /* Accent border effect */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(
      180deg,
      ${colors.accent},
      ${colors.accentHover}
    );
    border-radius: 2px 0 0 2px;
    box-shadow: 0 0 8px ${colors.accentGlow};
  }
`

export const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  width: 90%;
  max-width: 800px;
  margin: 2rem 0;
  padding: 0;
`

export const FollowUpButton = styled.button`
  padding: 1.25rem 1.5rem;
  font-size: 15px;
  font-weight: 500;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${colors.textSecondary};
  line-height: 1.4;
  text-align: left;

  /* Clean neumorphic design */
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  box-shadow: 8px 8px 16px ${colors.shadowDark},
    -8px -8px 16px ${colors.shadowLight},
    inset 1px 1px 2px ${colors.shadowLight},
    inset -1px -1px 2px ${colors.shadowAmbient};

  &:hover {
    color: ${colors.textPrimary};
    background: linear-gradient(145deg, #2a2a2e, ${colors.darkRaised});
    transform: translateY(-2px);

    box-shadow: 12px 12px 24px ${colors.shadowDark},
      -12px -12px 24px ${colors.shadowLight},
      inset 2px 2px 4px ${colors.shadowLight},
      inset -2px -2px 4px ${colors.shadowAmbient}, 0 0 20px ${colors.accentGlow};
  }

  &:active {
    transform: translateY(0);
    box-shadow: inset 8px 8px 16px ${colors.shadowDark},
      inset -8px -8px 16px ${colors.shadowLight};
  }

  /* Subtle accent indicator */
  &::before {
    content: '';
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 6px;
    height: 6px;
    background: ${colors.accent};
    border-radius: 50%;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
    box-shadow: 0 0 8px ${colors.accentGlow};
  }
`

export const ShuffleButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 140px;
  color: ${colors.textSecondary};

  /* Subtle neumorphic design */
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  box-shadow: 6px 6px 12px ${colors.shadowDark},
    -6px -6px 12px ${colors.shadowLight},
    inset 1px 1px 2px ${colors.shadowLight},
    inset -1px -1px 2px ${colors.shadowAmbient};

  &:hover:not(:disabled) {
    color: ${colors.textPrimary};
    transform: translateY(-1px);
    background: linear-gradient(145deg, #2a2a2e, ${colors.darkRaised});

    box-shadow: 8px 8px 16px ${colors.shadowDark},
      -8px -8px 16px ${colors.shadowLight},
      inset 2px 2px 4px ${colors.shadowLight},
      inset -2px -2px 4px ${colors.shadowAmbient}, 0 0 12px ${colors.accentGlow};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: inset 6px 6px 12px ${colors.shadowDark},
      inset -6px -6px 12px ${colors.shadowLight};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }

  svg {
    transition: transform 0.3s ease;
    font-size: 12px;
  }

  &:hover:not(:disabled) svg {
    transform: rotate(180deg);
  }
`

export const HighlightedText = styled.span`
  color: ${colors.accent};
  text-decoration: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    background: linear-gradient(
      145deg,
      ${colors.darkInset},
      ${colors.darkBase}
    );
    box-shadow: inset 2px 2px 4px ${colors.shadowDark},
      inset -2px -2px 4px ${colors.shadowLight};
    color: ${colors.textPrimary};
  }
`

export const HistoryEntry = styled.div`
  margin: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Subtle neumorphic card */
  background: linear-gradient(145deg, ${colors.darkBase}, ${colors.darkInset});
  box-shadow: 4px 4px 8px ${colors.shadowDark},
    -4px -4px 8px ${colors.shadowLight}, inset 1px 1px 2px ${colors.shadowLight},
    inset -1px -1px 2px rgba(0, 0, 0, 0.1);

  &:hover {
    background: linear-gradient(
      145deg,
      ${colors.darkRaised},
      ${colors.darkBase}
    );
    transform: translateY(-1px);
    box-shadow: 6px 6px 12px ${colors.shadowDark},
      -6px -6px 12px ${colors.shadowLight},
      inset 2px 2px 4px ${colors.shadowLight},
      inset -2px -2px 4px rgba(0, 0, 0, 0.1);
  }
`

export const HistoryQuery = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${colors.textPrimary};
  font-size: 14px;
  line-height: 1.3;
`

export const HistorySnippet = styled.div`
  font-size: 13px;
  color: ${colors.textTertiary};
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${colors.accent};
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 11px;
  font-weight: 500;
  margin-top: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    background: linear-gradient(
      145deg,
      ${colors.darkInset},
      ${colors.darkBase}
    );
    box-shadow: inset 2px 2px 4px ${colors.shadowDark},
      inset -2px -2px 4px ${colors.shadowLight};
    color: ${colors.textPrimary};
  }
`

export const ExpandedContent = styled.div`
  margin-top: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: ${colors.textSecondary};

  /* Inset neumorphic effect */
  background: linear-gradient(145deg, ${colors.darkInset}, ${colors.darkBase});
  box-shadow: inset 4px 4px 8px ${colors.shadowDark},
    inset -4px -4px 8px ${colors.shadowLight};
`

export const ConcisenessSidebar = styled.div`
  position: fixed;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
  padding: 1.5rem 1rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);

  /* Enhanced neumorphic design */
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  box-shadow: 12px 12px 24px ${colors.shadowDark},
    -12px -12px 24px ${colors.shadowLight},
    inset 2px 2px 4px ${colors.shadowLight},
    inset -2px -2px 4px ${colors.shadowAmbient};

  /* Subtle border glow */
  border: 1px solid rgba(255, 255, 255, 0.05);
`

export const SliderContainer = styled.div`
  position: relative;
  height: 100px;
  width: 20px;
  margin: 1rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SliderTrack = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 100%;
  border-radius: 3px;

  /* Inset track design */
  background: linear-gradient(180deg, ${colors.darkInset}, ${colors.darkBase});
  box-shadow: inset 3px 3px 6px ${colors.shadowDark},
    inset -3px -3px 6px ${colors.shadowLight};
`

export const SliderThumb = styled.div<{ $position: number }>`
  position: absolute;
  top: ${(props) => props.$position}%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;

  /* Accent colored thumb */
  background: linear-gradient(145deg, ${colors.accent}, ${colors.accentHover});
  box-shadow: 4px 4px 8px ${colors.shadowDark},
    -4px -4px 8px ${colors.shadowLight},
    inset 1px 1px 2px rgba(255, 255, 255, 0.15),
    inset -1px -1px 2px rgba(0, 0, 0, 0.2), 0 0 12px ${colors.accentGlow};

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    box-shadow: 6px 6px 12px ${colors.shadowDark},
      -6px -6px 12px ${colors.shadowLight},
      inset 2px 2px 4px rgba(255, 255, 255, 0.2),
      inset -2px -2px 4px rgba(0, 0, 0, 0.3), 0 0 20px ${colors.accentGlow};
  }

  &:active {
    transform: translate(-50%, -50%) scale(0.95);
    cursor: grabbing;
  }
`

export const SliderLabel = styled.div<{ $isActive: boolean }>`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) => (props.$isActive ? colors.accent : colors.textMuted)};
  text-align: center;
  margin: 0;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;

  /* Subtle neumorphic effect for active state */
  ${(props) =>
    props.$isActive &&
    `
    background: linear-gradient(145deg, ${colors.darkInset}, ${colors.darkBase});
    box-shadow: 
      inset 2px 2px 4px ${colors.shadowDark},
      inset -2px -2px 4px ${colors.shadowLight};
    text-shadow: 0 0 6px ${colors.accentGlow};
  `}

  &:hover {
    color: ${(props) =>
      props.$isActive ? colors.accent : colors.textSecondary};
    ${(props) =>
      !props.$isActive &&
      `
      background: linear-gradient(145deg, ${colors.darkBase}, ${colors.darkInset});
      box-shadow: 
        2px 2px 4px ${colors.shadowDark},
        -2px -2px 4px ${colors.shadowLight};
    `}
  }
`

export const SliderTitle = styled.div`
  font-size: 10px;
  font-weight: 600;
  color: ${colors.textTertiary};
  text-align: center;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
`

// Navigation Components
export const NavigationHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 2rem;
  background: linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase});
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  box-shadow: 0 8px 32px ${colors.shadowDark}, 0 -2px 8px ${colors.shadowLight},
    inset 0 1px 2px ${colors.shadowLight};
`

export const NavigationContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`

export const Logo = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: ${colors.textPrimary};
  margin: 0;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${colors.accent};
    text-shadow: 0 0 12px ${colors.accentGlow};
  }
`

export const NavigationLinks = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`

export const NavigationLink = styled.button<{ $isActive?: boolean }>`
  padding: 0.75rem 1.5rem;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: ${(props) => (props.$isActive ? colors.accent : colors.textSecondary)};
  background: ${(props) =>
    props.$isActive
      ? `linear-gradient(145deg, ${colors.darkInset}, ${colors.darkBase})`
      : `linear-gradient(145deg, ${colors.darkRaised}, ${colors.darkBase})`};

  box-shadow: ${(props) =>
    props.$isActive
      ? `inset 6px 6px 12px ${colors.shadowDark}, inset -6px -6px 12px ${colors.shadowLight}`
      : `6px 6px 12px ${colors.shadowDark}, -6px -6px 12px ${colors.shadowLight}, inset 1px 1px 2px ${colors.shadowLight}`};

  &:hover {
    color: ${colors.textPrimary};
    background: linear-gradient(145deg, #2a2a2e, ${colors.darkRaised});
    transform: translateY(-1px);

    box-shadow: 8px 8px 16px ${colors.shadowDark},
      -8px -8px 16px ${colors.shadowLight},
      inset 2px 2px 4px ${colors.shadowLight}, 0 0 12px ${colors.accentGlow};
  }

  &:active {
    transform: translateY(0);
    box-shadow: inset 6px 6px 12px ${colors.shadowDark},
      inset -6px -6px 12px ${colors.shadowLight};
  }
`
