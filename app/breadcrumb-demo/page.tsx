'use client'

import React, { useState } from 'react'
import styled from 'styled-components'
import Breadcrumbs from '../components/Breadcrumbs'
import HorizontalBreadcrumbs from '../components/HorizontalBreadcrumbs'
import FloatingBreadcrumbs from '../components/FloatingBreadcrumbs'

const DemoContainer = styled.div`
  min-height: 100vh;
  background: #1e1e1e;
  color: #e0e0e0;
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Title = styled.h1`
  font-size: 32px;
  margin-bottom: 40px;
  text-align: center;
  color: #f0f0f0;
`

const Controls = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 40px;
  flex-wrap: wrap;
  justify-content: center;
`

const Button = styled.button`
  padding: 12px 24px;
  background: #333;
  border: 1px solid #444;
  border-radius: 8px;
  color: #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #444;
    border-color: #555;
  }
`

const VariantToggle = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 80px;
`

const VariantButton = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#444' : '#2a2a2a'};
  border: 1px solid ${props => props.$isActive ? '#666' : '#333'};
  border-radius: 6px;
  color: ${props => props.$isActive ? '#fff' : '#888'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #444;
    color: #fff;
  }
`

const InfoBox = styled.div`
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  margin-top: 40px;
  font-size: 14px;
  line-height: 1.6;
`

export default function BreadcrumbDemo() {
  const [items, setItems] = useState<Array<{
    id: string
    label: string
    phase: 'explore' | 'discover' | 'deep-dive' | 'synthesize'
  }>>([])
  
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [variant, setVariant] = useState<'vertical' | 'horizontal' | 'floating'>('vertical')
  
  const sampleQueries = [
    'What is quantum computing?',
    'How do qubits work?',
    'Quantum entanglement explained',
    'Applications of quantum computers',
    'Quantum algorithms',
    'Future of quantum computing',
    'Quantum vs classical computing',
    'Building quantum computers'
  ]
  
  const determinePhase = (index: number): 'explore' | 'discover' | 'deep-dive' | 'synthesize' => {
    if (index === 0) return 'explore'
    if (index <= 2) return 'discover'
    if (index <= 4) return 'deep-dive'
    return 'synthesize'
  }
  
  const addRandomItem = () => {
    const query = sampleQueries[Math.floor(Math.random() * sampleQueries.length)]
    const newItem = {
      id: `item-${Date.now()}`,
      label: query,
      phase: determinePhase(items.length)
    }
    setItems([...items, newItem])
    setCurrentIndex(items.length)
  }
  
  const handleItemClick = (index: number) => {
    setCurrentIndex(index)
  }
  
  const clearItems = () => {
    setItems([])
    setCurrentIndex(-1)
  }
  
  return (
    <DemoContainer>
      <Title>Breadcrumb Component Demo</Title>
      
      <VariantToggle>
        <VariantButton
          $isActive={variant === 'vertical'}
          onClick={() => setVariant('vertical')}
        >
          Vertical Dots
        </VariantButton>
        <VariantButton
          $isActive={variant === 'horizontal'}
          onClick={() => setVariant('horizontal')}
        >
          Horizontal Phases
        </VariantButton>
        <VariantButton
          $isActive={variant === 'floating'}
          onClick={() => setVariant('floating')}
        >
          Floating Mini-Map
        </VariantButton>
      </VariantToggle>
      
      <Controls>
        <Button onClick={addRandomItem}>Add Query</Button>
        <Button onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}>
          Previous
        </Button>
        <Button onClick={() => currentIndex < items.length - 1 && setCurrentIndex(currentIndex + 1)}>
          Next
        </Button>
        <Button onClick={clearItems}>Clear All</Button>
      </Controls>
      
      {variant === 'vertical' && (
        <Breadcrumbs
          items={items}
          currentIndex={currentIndex}
          onItemClick={handleItemClick}
        />
      )}
      
      {variant === 'horizontal' && (
        <HorizontalBreadcrumbs
          items={items}
          currentIndex={currentIndex}
          onItemClick={handleItemClick}
        />
      )}
      
      {variant === 'floating' && (
        <FloatingBreadcrumbs
          items={items}
          currentIndex={currentIndex}
          onItemClick={handleItemClick}
        />
      )}
      
      <InfoBox>
        <h3>Current Status:</h3>
        <p>Items: {items.length}</p>
        <p>Current Index: {currentIndex}</p>
        <p>Current Phase: {items[currentIndex]?.phase || 'N/A'}</p>
        <p>Current Query: {items[currentIndex]?.label || 'N/A'}</p>
        
        <h3 style={{ marginTop: '20px' }}>Phase Colors:</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ color: '#7dd3c0' }}>• Explore - Soft Teal</li>
          <li style={{ color: '#a78bfa' }}>• Discover - Soft Purple</li>
          <li style={{ color: '#f9a8d4' }}>• Deep Dive - Soft Pink</li>
          <li style={{ color: '#fbbf24' }}>• Synthesize - Soft Amber</li>
        </ul>
      </InfoBox>
    </DemoContainer>
  )
}