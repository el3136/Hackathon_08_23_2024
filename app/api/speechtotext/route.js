'use server'

import { AssemblyAI } from 'assemblyai';
import { NextResponse } from 'next/server';



const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_KEY,
});

// You can also transcribe a local file by passing in a file path
// const FILE_URL = '/phone_number_test.m4a';
const FILE_URL = 'https://github.com/el3136/Hackathon_08_23_2024/raw/main/public/phone_number_test.m4a';

// Request parameters 
const data = {
  audio_url: FILE_URL,
  // audio: FILE_URL,
}

const run = async () => {
  const transcript = await client.transcripts.transcribe(data);
  console.log(transcript);
  console.log(transcript.text);
  return transcript.text;
};

// POST function to handle incoming requests
export async function GET(req) {
  // Error: Transcript creation error, audio_url should start with http

  // const transcription = await run();
  const transcription = '1234-5678 910.';
  console.log(transcription)

  const data = {transcription: transcription}
  // const data = res.json(); // not a function

  console.log( NextResponse.json({ transcription: transcription }))

  // Return the completion response as JSON
  
  return NextResponse.json(
    JSON.stringify({ transcription: transcription }),
    { status: 200 }
  )

  // return new Response(JSON.stringify(data), {
  //   status: 200,
  //   headers: { 'Content-Type': 'application/json' },
  // });
}