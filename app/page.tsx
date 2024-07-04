'use client'

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeUp, faVolumeOff } from '@fortawesome/free-solid-svg-icons'

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

  const [isSoundOn, setIsSoundOn] = useState(true)

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
          generate_audio: isSoundOn,
        }),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      let textResponse
      if (isSoundOn) {
        const textResponseHeader = response.headers.get('X-Text-Response')
        if (textResponseHeader) {
          textResponse = JSON.parse(textResponseHeader)
        } else {
          throw new Error('X-Text-Response header not found')
        }

        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      } else {
        textResponse = await response.json()
      }

      console.log('🚀 ~ handleOpenAI ~ textResponse:', textResponse)

      setResult(textResponse.answer || '')
      setOptions(textResponse.options || [])
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
  const toggleSound = () => {
    setIsSoundOn(!isSoundOn)
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
        <button onClick={toggleSound}>
          <FontAwesomeIcon icon={isSoundOn ? faVolumeUp : faVolumeOff} />
        </button>
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
