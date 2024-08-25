'use server'

import { AssemblyAI } from 'assemblyai';



const client = new AssemblyAI({
  apiKey: process.env.NEXT_PUBLIC_ASSEMBLY_AI_KEY,
});

// You can also transcribe a local file by passing in a file path
// const FILE_URL = '/phone_number_test.m4a';
const FILE_URL = 'http://localhost:3000/phone_number_test.m4a';

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
export async function GET() {
  // Error: Transcript creation error, audio_url should start with http

  const transcription = await run();

  return new NextResponse.json(
    { name: transcription },
    { status: 200 }
  );

  // return new NextResponse(
  //   JSON.stringify({ name: transcription }),
  //   { status: 200 }
  // );
}