'use client'

import { Box, Button, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';


export default function Home() {
  const [transcription, setTranscription] = useState('');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('');
  
  const transcibeAudioFileText = async () => {
    try {
      const response = await fetch('/api/speechtotext', {
        method: 'GET',
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json().then((data) => {
        return JSON.parse(data);
      }).catch(error => {
        console.error('Error:', error);
      });
      console.log(result);
      console.log(result.transcription);

      setTranscription(result.transcription);

    } catch (error) {
      console.error('Error:', error)
    }
  }
  const LLMphase = async () => {
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={'column'}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={'column'}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >

          <Button onClick={transcibeAudioFileText}>Transcribe</Button>
          <Box>Transcription : {transcription}</Box>

        </Stack>
      </Stack>
    </Box>
  )
}