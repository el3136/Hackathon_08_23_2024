'use client'

import { Box, Button, Stack, TextField } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTTS } from '@cartesia/cartesia-js/react';

export default function Home() {
  const [transcription, setTranscription] = useState('');
  const [fullTextResponse, setFullTextResponse] = useState('');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! How can I help you today?",
    },
  ])
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const tts = useTTS({
		apiKey: process.env.NEXT_PUBLIC_CARTESIA_AI_KEY,
		sampleRate: 44100,
	})

	const [textCartesia, setTextCartesia] = useState("");

	const handlePlay = async () => {
		// Begin buffering the audio.
		const response = await tts.buffer({
			model_id: "sonic-english",
			voice: {
        		mode: "id",
        		id: "a0e99841-438c-4a64-b679-ae501e7d6091",
        	},
			transcript: textCartesia,
		});

		// Immediately play the audio. (You can also buffer in advance and play later.)
		await tts.play();
	}
  
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

      setIsLoading(false);

    } catch (error) {
      console.error('Error:', error)
    }
  }

  const LLMphase = async () => {
    setIsLoading(true)
  
    setMessage((m) => {
      return transcription
    })
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

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

      console.log(messages[messages.length - 1].content)
      console.log(messages)

      setTextCartesia(messages[messages.length - 1].content)
      setFullTextResponse((full) => {return full + messages[messages.length - 1].content})

      console.log(textCartesia)
      console.log(fullTextResponse)

      // play the audio
      await handlePlay()

    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    
    // setIsLoading(true)
  }

  useTTS

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      mt={2}
      mb={2}
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

          <Box></Box>
          <Button onClick={transcibeAudioFileText}>Transcribe</Button>
          <Box>Transcription : {transcription}</Box>
          <Button 
            variant="contained" 
            onClick={LLMphase}
            disabled={isLoading}
          >
            Get response
          </Button>
          <Box>Text Response : {fullTextResponse}</Box>

        </Stack>
      </Stack>
    </Box>
  )
}