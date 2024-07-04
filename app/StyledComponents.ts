import styled from 'styled-components'

export const MainContainer = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 5vh;
  min-height: 100vh;
`

export const InputContainer = styled.div`
  width: 80%;
  max-width: 500px;
`

export const CenteredInput = styled.input`
  width: 100%;
  padding: 20px;
  font-size: 24px;
  border: 2px solid #ccc;
  border-radius: 10px;
  outline: none;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 10px rgba(0, 123, 255, 0.2);
  }
`

export const Result = styled.p`
  text-align: left;
  font-size: 24px;
  margin-top: 20px;
  width: 50%;
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
  font-size: 18px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`
