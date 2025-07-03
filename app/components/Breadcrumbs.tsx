'use client'

import React from 'react'
import styled from 'styled-components'

interface BreadcrumbItem {
  id: string
  label: string
  phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  currentIndex: number
  onItemClick?: (index: number) => void
}

const BreadcrumbContainer = styled.div`
  position: fixed;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 100;
  padding: 20px 0;
`

const BreadcrumbWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`

const BreadcrumbDot = styled.button<{ 
  $isActive: boolean
  $phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
  $isPast: boolean
}>`
  width: ${props => props.$isActive ? '14px' : '10px'};
  height: ${props => props.$isActive ? '14px' : '10px'};
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  margin-right: 12px;
  
  /* Phase-based colors - muted and chill */
  background: ${props => {
    const colors = {
      'explore': '#7dd3c0',      // Soft teal
      'discover': '#a78bfa',     // Soft purple
      'deep-dive': '#f9a8d4',    // Soft pink
      'synthesize': '#fbbf24'    // Soft amber
    }
    const color = colors[props.$phase]
    
    if (props.$isActive) {
      return color
    } else if (props.$isPast) {
      return `${color}99` // 60% opacity
    } else {
      return `${color}33` // 20% opacity
    }
  }};
  
  &:hover {
    transform: scale(1.2);
    box-shadow: 0 0 20px ${props => {
      const colors = {
        'explore': '#7dd3c033',
        'discover': '#a78bfa33',
        'deep-dive': '#f9a8d433',
        'synthesize': '#fbbf2433'
      }
      return colors[props.$phase]
    }};
  }
  
  &::before {
    content: '';
    position: absolute;
    width: ${props => props.$isActive ? '24px' : '0'};
    height: ${props => props.$isActive ? '24px' : '0'};
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: ${props => {
      const colors = {
        'explore': '#7dd3c020',
        'discover': '#a78bfa20',
        'deep-dive': '#f9a8d420',
        'synthesize': '#fbbf2420'
      }
      return colors[props.$phase]
    }};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
`

const BreadcrumbLabel = styled.span<{ 
  $isActive: boolean
  $phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
}>`
  font-size: 12px;
  color: ${props => {
    const colors = {
      'explore': '#7dd3c0',
      'discover': '#a78bfa',
      'deep-dive': '#f9a8d4',
      'synthesize': '#fbbf24'
    }
    return props.$isActive ? colors[props.$phase] : '#666'
  }};
  opacity: ${props => props.$isActive ? 1 : 0};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-weight: ${props => props.$isActive ? 500 : 400};
  letter-spacing: 0.5px;
  max-width: ${props => props.$isActive ? '120px' : '0'};
  overflow: hidden;
  margin-left: ${props => props.$isActive ? '0' : '-12px'};
`

const PhaseIndicator = styled.div<{ $phase: string }>`
  position: absolute;
  left: -60px;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #555;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  opacity: 0.6;
`

const Connector = styled.div<{ $isActive: boolean }>`
  position: absolute;
  width: 2px;
  height: 32px;
  left: 4px;
  top: 14px;
  background: linear-gradient(
    to bottom,
    ${props => props.$isActive ? '#666' : '#333'},
    transparent
  );
  opacity: ${props => props.$isActive ? 0.3 : 0.1};
  transition: opacity 0.3s ease;
`

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  currentIndex, 
  onItemClick 
}) => {
  return (
    <BreadcrumbContainer>
      {items.map((item, index) => {
        const isActive = index === currentIndex
        const isPast = index < currentIndex
        const showPhaseLabel = index === 0 || items[index - 1]?.phase !== item.phase
        
        return (
          <React.Fragment key={item.id}>
            <BreadcrumbWrapper>
              {showPhaseLabel && (
                <PhaseIndicator $phase={item.phase}>
                  {item.phase.replace('-', ' ')}
                </PhaseIndicator>
              )}
              
              <BreadcrumbDot
                $isActive={isActive}
                $phase={item.phase}
                $isPast={isPast}
                onClick={() => onItemClick?.(index)}
                aria-label={`Go to ${item.label}`}
              />
              
              <BreadcrumbLabel $isActive={isActive} $phase={item.phase}>
                {item.label}
              </BreadcrumbLabel>
              
              {index < items.length - 1 && (
                <Connector $isActive={isPast || isActive} />
              )}
            </BreadcrumbWrapper>
          </React.Fragment>
        )
      })}
    </BreadcrumbContainer>
  )
}

export default Breadcrumbs