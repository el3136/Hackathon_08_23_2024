const AssemblyAI = require('assemblyai');
const fs = require('fs');

const transcription = []

const transcribeLocalFile = async () => {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLY_AI_KEY,
  });

  const file = fs.readFileSync('/phone_number_test.m4a');
  const data = {
    audio: file,
  };

  const transcript = await client.transcripts.transcribe(data);
  console.log('Transcription:', transcript.text);
  transcription.push(transcript.text)
};

transcribeLocalFile();

// export transcription[0];