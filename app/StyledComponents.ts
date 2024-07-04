import styled from 'styled-components'

export const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5vh;
  min-height: 100vh;
  background-color: #1e1e1e;
  color: #e0e0e0;
`

export const InputContainer = styled.div`
  width: 80%;
  max-width: 500px;
  display: flex;
  align-items: center;
`

export const CenteredInput = styled.input`
  width: 100%;
  height: 50px; // Set height to 50px
  padding: 0 15px; // Adjust padding to fit the new height
  font-size: 18px;
  border: 2px solid #444;
  border-radius: 10px 0 0 10px;
  outline: none;
  transition: border-color 0.3s ease;
  background-color: #2a2a2a;
  color: #e0e0e0;

  &:focus {
    border-color: #4a90e2;
    box-shadow: 0 0 10px rgba(74, 144, 226, 0.2);
  }
`

export const SpeakerButton = styled.button`
  height: 53px; // Set height to 50px
  padding: 0 20px;
  font-size: 18px;
  background-color: #2a2a2a;
  color: #e0e0e0;
  border: 2px solid #444;
  border-left: none;
  border-radius: 0 10px 10px 0;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3a3a3a;
  }
`

export const Result = styled.p`
  text-align: left;
  font-size: 18px;
  margin-top: 20px;
  width: 80%;
  max-width: 600px;
  line-height: 1.6;
`

export const ButtonContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  width: 80%;
  max-width: 500px;
  margin-top: 20px;
`

export const FollowUpButton = styled.button`
  padding: 15px;
  font-size: 16px;
  background-color: #f0f0f0;
  color: #222;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #3a7bc8;
  }
`
