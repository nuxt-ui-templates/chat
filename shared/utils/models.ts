export const MODELS = [
  { label: 'Claude Haiku 5.5', value: 'anthropic/claude-haiku-5.5', icon: 'i-simple-icons-anthropic' },
  { label: 'Gemini 3 Flash', value: 'google/gemini-3-flash', icon: 'i-simple-icons-google' },
  { label: 'GPT-5.6 Luna', value: 'openai/gpt-5.6-luna', icon: 'i-simple-icons-openai' },
  { label: 'DeepSeek V4.1 Flash', value: 'deepseek/deepseek-v4.1-flash', icon: 'i-simple-icons-deepseek' }
]

// Streaming speech-to-text model used for dictation, served through the AI Gateway
export const TRANSCRIPTION_MODEL = 'openai/gpt-live-transcribe'
