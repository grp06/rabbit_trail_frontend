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

const FloatingContainer = styled.div`
  position: fixed;
  right: 32px;
  bottom: 32px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  z-index: 100;
`

const MiniMapContainer = styled.div`
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 16px;
  max-width: 280px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
`

const PhaseProgress = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
`

const PhaseDot = styled.div<{ 
  $phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
  $isActive: boolean 
}>`
  width: 24px;
  height: 4px;
  border-radius: 2px;
  transition: all 0.3s ease;
  background: ${props => {
    const colors = {
      'explore': '#7dd3c0',
      'discover': '#a78bfa',
      'deep-dive': '#f9a8d4',
      'synthesize': '#fbbf24'
    }
    return props.$isActive ? colors[props.$phase] : `${colors[props.$phase]}20`
  }};
`

const CurrentPhase = styled.div<{ $phase: string }>`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: ${props => {
    const colors = {
      'explore': '#7dd3c0',
      'discover': '#a78bfa',
      'deep-dive': '#f9a8d4',
      'synthesize': '#fbbf24'
    }
    return colors[props.$phase as keyof typeof colors] || '#666'
  }};
  opacity: 0.6;
  margin-bottom: 8px;
  font-weight: 600;
`

const BreadcrumbList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const BreadcrumbStep = styled.button<{ 
  $isActive: boolean
  $phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
  $isPast: boolean
}>`
  background: none;
  border: none;
  padding: 8px 12px;
  text-align: right;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  position: relative;
  
  color: ${props => {
    if (props.$isActive) {
      const colors = {
        'explore': '#7dd3c0',
        'discover': '#a78bfa',
        'deep-dive': '#f9a8d4',
        'synthesize': '#fbbf24'
      }
      return colors[props.$phase]
    }
    return props.$isPast ? '#888' : '#555'
  }};
  
  opacity: ${props => props.$isActive ? 1 : props.$isPast ? 0.7 : 0.4};
  
  &:hover {
    opacity: 1;
    transform: translateX(-4px);
  }
  
  &::before {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: ${props => props.$isActive ? '3px' : '0'};
    height: ${props => props.$isActive ? '16px' : '0'};
    border-radius: 2px;
    background: ${props => {
      const colors = {
        'explore': '#7dd3c0',
        'discover': '#a78bfa',
        'deep-dive': '#f9a8d4',
        'synthesize': '#fbbf24'
      }
      return colors[props.$phase]
    }};
    transition: all 0.3s ease;
  }
`

const StepNumber = styled.span`
  font-size: 10px;
  opacity: 0.5;
  margin-right: 8px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
`

const ToggleButton = styled.button`
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 8px 16px;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(40, 40, 40, 0.9);
    color: #aaa;
  }
`

export const FloatingBreadcrumbs: React.FC<BreadcrumbsProps> = ({ 
  items, 
  currentIndex, 
  onItemClick 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true)
  
  if (items.length === 0) return null
  
  const currentItem = items[currentIndex]
  const phases: Array<'explore' | 'discover' | 'deep-dive' | 'synthesize'> = 
    ['explore', 'discover', 'deep-dive', 'synthesize']
  
  // Count items in each phase
  const phaseCounts = items.reduce((acc, item) => {
    acc[item.phase] = (acc[item.phase] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  if (!isExpanded) {
    return (
      <FloatingContainer>
        <ToggleButton onClick={() => setIsExpanded(true)}>
          Journey Map • {currentIndex + 1} of {items.length}
        </ToggleButton>
      </FloatingContainer>
    )
  }
  
  return (
    <FloatingContainer>
      <MiniMapContainer>
        <CurrentPhase $phase={currentItem?.phase || 'explore'}>
          {currentItem?.phase.replace('-', ' ') || 'explore'}
        </CurrentPhase>
        
        <PhaseProgress>
          {phases.map(phase => (
            <PhaseDot
              key={phase}
              $phase={phase}
              $isActive={phaseCounts[phase] > 0}
              style={{ flex: phaseCounts[phase] || 0 }}
            />
          ))}
        </PhaseProgress>
        
        <BreadcrumbList>
          {items.slice(-5).map((item, idx) => {
            const actualIndex = items.length - 5 + idx
            const isActive = actualIndex === currentIndex
            const isPast = actualIndex < currentIndex
            
            return (
              <BreadcrumbStep
                key={item.id}
                $isActive={isActive}
                $phase={item.phase}
                $isPast={isPast}
                onClick={() => onItemClick?.(actualIndex)}
              >
                <StepNumber>{String(actualIndex + 1).padStart(2, '0')}</StepNumber>
                {item.label}
              </BreadcrumbStep>
            )
          })}
        </BreadcrumbList>
        
        <ToggleButton 
          onClick={() => setIsExpanded(false)}
          style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}
        >
          Minimize
        </ToggleButton>
      </MiniMapContainer>
    </FloatingContainer>
  )
}

export default FloatingBreadcrumbs