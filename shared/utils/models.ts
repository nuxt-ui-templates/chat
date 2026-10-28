export const MODELS = [
  { label: 'Claude Haiku 5.5', value: 'anthropic/claude-haiku-5.5', icon: 'i-simple-icons-anthropic' },
  { label: 'Gemini 3.8 Flash', value: 'google/gemini-3.8-flash', icon: 'i-simple-icons-google' },
  { label: 'GPT-6 Luna', value: 'openai/gpt-6-luna', icon: 'i-simple-icons-openai' }
]

// Streaming speech-to-text model used for dictation, served through the AI Gateway
export const TRANSCRIPTION_MODEL = 'openai/gpt-live-transcribe'
