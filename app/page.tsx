'use client'

import styled from 'styled-components'
import { useState } from 'react'

import {
  MainContainer,
  InputContainer,
  CenteredInput,
  Result,
  ButtonContainer,
  FollowUpButton,
} from './StyledComponents'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([])

  const handleOpenAI = async (message: string) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversation_history: inputText === '' ? conversationHistory : [],
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const textResponseHeader = response.headers.get('X-Text-Response')
      if (textResponseHeader) {
        const textResponse = JSON.parse(textResponseHeader)
        console.log('🚀 ~ handleOpenAI ~ textResponse:', textResponse)

        setResult(textResponse.answer || '')
        setOptions(textResponse.options || [])
        setConversationHistory(
          inputText === ''
            ? [
                ...conversationHistory,
                { role: 'user', content: message },
                { role: 'assistant', content: textResponse.answer },
              ]
            : [
                { role: 'user', content: message },
                { role: 'assistant', content: textResponse.answer },
              ]
        )
        setInputText('')

        // Handle audio
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      } else {
        console.error('X-Text-Response header not found')
        setResult('Error: No response from the server')
        setOptions([])
      }
    } catch (error) {
      console.error('Error:', error)
      setResult('Error: Something went wrong')
      setOptions([])
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleOpenAI(inputText)
  }

  const handleFollowUpClick = (question: string) => {
    handleOpenAI(question)
  }

  return (
    <MainContainer>
      <InputContainer>
        <form onSubmit={handleSubmit}>
          <CenteredInput
            type="text"
            placeholder="Enter text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button type="submit" style={{ display: 'none' }} />
        </form>
      </InputContainer>
      {result && <Result>{result}</Result>}
      {options.length > 0 && (
        <ButtonContainer>
          {options.map((option, index) => (
            <FollowUpButton
              key={index}
              onClick={() => handleFollowUpClick(option)}
            >
              {option}
            </FollowUpButton>
          ))}
        </ButtonContainer>
      )}
    </MainContainer>
  )
}
