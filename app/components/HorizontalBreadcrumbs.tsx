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
  right: 40px;
  top: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
  z-index: 100;
  max-width: 300px;
`

const PhaseGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`

const PhaseLabel = styled.div<{ $phase: string }>`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: ${props => {
    const colors = {
      'explore': '#7dd3c0',
      'discover': '#a78bfa',
      'deep-dive': '#f9a8d4',
      'synthesize': '#fbbf24'
    }
    return colors[props.$phase as keyof typeof colors] || '#666'
  }};
  opacity: 0.4;
  font-weight: 600;
  margin-bottom: 4px;
`

const BreadcrumbTrail = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
`

const BreadcrumbItem = styled.button<{ 
  $isActive: boolean
  $phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
  $isPast: boolean
}>`
  padding: 6px 12px;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
  
  /* Phase-based styling */
  background: ${props => {
    const colors = {
      'explore': { bg: '#7dd3c010', active: '#7dd3c020' },
      'discover': { bg: '#a78bfa10', active: '#a78bfa20' },
      'deep-dive': { bg: '#f9a8d410', active: '#f9a8d420' },
      'synthesize': { bg: '#fbbf2410', active: '#fbbf2420' }
    }
    const colorSet = colors[props.$phase]
    
    if (props.$isActive) {
      return colorSet.active
    } else if (props.$isPast) {
      return colorSet.bg
    } else {
      return 'transparent'
    }
  }};
  
  color: ${props => {
    const colors = {
      'explore': '#7dd3c0',
      'discover': '#a78bfa',
      'deep-dive': '#f9a8d4',
      'synthesize': '#fbbf24'
    }
    
    if (props.$isActive) {
      return colors[props.$phase]
    } else if (props.$isPast) {
      return `${colors[props.$phase]}99`
    } else {
      return '#666'
    }
  }};
  
  border: 1px solid ${props => {
    const colors = {
      'explore': '#7dd3c020',
      'discover': '#a78bfa20',
      'deep-dive': '#f9a8d420',
      'synthesize': '#fbbf2420'
    }
    
    if (props.$isActive || props.$isPast) {
      return colors[props.$phase]
    } else {
      return 'transparent'
    }
  }};
  
  font-weight: ${props => props.$isActive ? 500 : 400};
  
  &:hover {
    background: ${props => {
      const colors = {
        'explore': '#7dd3c020',
        'discover': '#a78bfa20',
        'deep-dive': '#f9a8d420',
        'synthesize': '#fbbf2420'
      }
      return colors[props.$phase]
    }};
    
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => {
      const colors = {
        'explore': '#7dd3c020',
        'discover': '#a78bfa20',
        'deep-dive': '#f9a8d420',
        'synthesize': '#fbbf2420'
      }
      return colors[props.$phase]
    }};
  }
  
  &::after {
    content: '→';
    position: absolute;
    right: -3px;
    top: 50%;
    transform: translateY(-50%);
    opacity: ${props => props.$isPast && !props.$isActive ? 0.3 : 0};
    color: #666;
    font-size: 10px;
  }
`

const ProgressBar = styled.div<{ $progress: number }>`
  position: fixed;
  top: 72px;
  right: 40px;
  left: 40px;
  height: 2px;
  background: #333;
  border-radius: 1px;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: ${props => props.$progress}%;
    background: linear-gradient(
      to right,
      #7dd3c0,
      #a78bfa,
      #f9a8d4,
      #fbbf24
    );
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }
`

export const HorizontalBreadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  currentIndex, 
  onItemClick 
}) => {
  // Group items by phase
  const groupedItems = items.reduce((acc, item, index) => {
    const phase = item.phase
    if (!acc[phase]) {
      acc[phase] = []
    }
    acc[phase].push({ ...item, index })
    return acc
  }, {} as Record<string, Array<BreadcrumbItem & { index: number }>>)
  
  const progress = items.length > 0 ? ((currentIndex + 1) / items.length) * 100 : 0
  
  return (
    <>
      <ProgressBar $progress={progress} />
      
      <BreadcrumbContainer>
        {Object.entries(groupedItems).map(([phase, phaseItems]) => (
          <PhaseGroup key={phase}>
            <PhaseLabel $phase={phase}>
              {phase.replace('-', ' ')}
            </PhaseLabel>
            <BreadcrumbTrail>
              {phaseItems.map((item) => {
                const isActive = item.index === currentIndex
                const isPast = item.index < currentIndex
                
                return (
                  <BreadcrumbItem
                    key={item.id}
                    $isActive={isActive}
                    $phase={item.phase}
                    $isPast={isPast}
                    onClick={() => onItemClick?.(item.index)}
                    title={item.label}
                  >
                    {item.label}
                  </BreadcrumbItem>
                )
              })}
            </BreadcrumbTrail>
          </PhaseGroup>
        ))}
      </BreadcrumbContainer>
    </>
  )
}

export default HorizontalBreadcrumbs