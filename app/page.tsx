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
  SpeakerButton,
} from './StyledComponents'

export default function Home() {
  const [inputText, setInputText] = useState('')
  const [result, setResult] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [conversationHistory, setConversationHistory] = useState<
    Array<{ role: string; content: string }>
  >([])

  const [isSoundOn, setIsSoundOn] = useState(true)

  const handleOpenAI = async (message: string, includeHistory: boolean) => {
    console.log('Sending message to OpenAI:', message)
    console.log('Include history:', includeHistory)
    console.log('Current conversation history:', conversationHistory)

    try {
      const response = await fetch('http://127.0.0.1:8000/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          conversation_history: includeHistory ? conversationHistory : [],
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

      // Update conversation history
      setConversationHistory((prevHistory) => [
        ...prevHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: textResponse.answer || '' },
      ])
    } catch (error) {
      console.error('Error:', error)
      setResult('Error: Something went wrong')
      setOptions([])
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('Form submitted with input:', inputText)
    handleOpenAI(inputText, false) // Do not include history on submit
  }

  const handleFollowUpClick = (question: string) => {
    console.log('Follow-up question clicked:', question)
    handleOpenAI(question, true) // Include history on follow-up click
  }

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn)
    console.log('Sound toggled. Is sound on:', !isSoundOn)
  }

  return (
    <MainContainer>
      <InputContainer>
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', width: '100%' }}
        >
          <CenteredInput
            type="text"
            placeholder="Enter text here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <SpeakerButton type="button" onClick={toggleSound}>
            <FontAwesomeIcon icon={isSoundOn ? faVolumeUp : faVolumeOff} />
          </SpeakerButton>
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
