'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  ConcisenessSidebar,
  SliderContainer,
  SliderTrack,
  SliderThumb,
  SliderLabel,
  SliderTitle,
} from '../StyledComponents'
import { AppState } from '../state'

type Conciseness = AppState['conciseness']

interface ConcisenessSliderProps {
  conciseness: Conciseness
  onConcisenessChange: (value: Conciseness) => void
}

export const ConcisenessSlider: React.FC<ConcisenessSliderProps> = ({
  conciseness,
  onConcisenessChange,
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const handleSliderInteraction = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const { currentTarget, clientX, clientY } = event
      const { left, top, width, height } = currentTarget.getBoundingClientRect()
      const isMobile = window.innerWidth <= 768

      let newConciseness: Conciseness
      if (isMobile) {
        // Horizontal slider for mobile
        const x = clientX - left
        const percentage = (x / width) * 100
        if (percentage <= 35) {
          newConciseness = 'short'
        } else if (percentage <= 65) {
          newConciseness = 'medium'
        } else {
          newConciseness = 'long'
        }
      } else {
        // Vertical slider for desktop
        const y = clientY - top
        const percentage = (y / height) * 100
        if (percentage <= 35) {
          newConciseness = 'short'
        } else if (percentage <= 65) {
          newConciseness = 'medium'
        } else {
          newConciseness = 'long'
        }
      }

      if (newConciseness !== conciseness) {
        onConcisenessChange(newConciseness)
      }
    },
    [conciseness, onConcisenessChange]
  )

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true)
      handleSliderInteraction(event)
    },
    [handleSliderInteraction]
  )

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        handleSliderInteraction(event)
      }
    },
    [isDragging, handleSliderInteraction]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const sliderPosition = useMemo(() => {
    switch (conciseness) {
      case 'short':
        return 20
      case 'medium':
        return 50
      case 'long':
        return 80
      default:
        return 20
    }
  }, [conciseness])

  const handleLabelClick = (value: Conciseness) => {
    onConcisenessChange(value)
  }

  return (
    <ConcisenessSidebar>
      <SliderTitle>Detail</SliderTitle>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <SliderLabel
          $isActive={conciseness === 'short'}
          onClick={() => handleLabelClick('short')}
        >
          Short
        </SliderLabel>
        <SliderContainer
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <SliderTrack />
          <SliderThumb $position={sliderPosition} />
        </SliderContainer>
        <SliderLabel
          $isActive={conciseness === 'long'}
          onClick={() => handleLabelClick('long')}
        >
          Long
        </SliderLabel>
      </div>
    </ConcisenessSidebar>
  )
}
