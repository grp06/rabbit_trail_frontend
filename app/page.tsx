'use client'

import styled from 'styled-components'

const CenteredInput = styled.input`
  display: block;
  width: 80%;
  max-width: 500px;
  padding: 20px;
  font-size: 24px;
  border: 2px solid #ccc;
  border-radius: 10px;
  margin: 0 auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
  }
`

export default function Home() {
  return (
    <main>
      <CenteredInput type="text" placeholder="Enter text here..." />
    </main>
  )
}
