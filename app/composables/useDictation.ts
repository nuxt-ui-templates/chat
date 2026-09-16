import type { StreamTranscriptionResult } from 'ai'
import {
  createGateway,
  experimental_encodeRealtimeAudio as encodeRealtimeAudio,
  experimental_resampleAudio as resampleAudio,
  experimental_streamTranscribe as streamTranscribe
} from 'ai'

const SAMPLE_RATE = 24_000
// Recordings stop on their own after this long.
const MAX_DURATION = 120_000

export function isDictationSupported() {
  return typeof window !== 'undefined'
    && typeof AudioContext !== 'undefined'
    && !!navigator.mediaDevices?.getUserMedia
}

interface Session {
  stream: MediaStream
  audioContext: AudioContext
  source: MediaStreamAudioSourceNode
  processor: ScriptProcessorNode
  audio: ReadableStreamDefaultController<string>
  abort: AbortController
  result: StreamTranscriptionResult
  finals: string[]
  partial: string
  timeout: ReturnType<typeof setTimeout>
}

/**
 * Streams microphone audio to the transcription model over a WebSocket opened
 * from the browser with a short-lived token, and exposes the transcript as it arrives.
 */
export function useDictation() {
  const { csrf, headerName } = useCsrf()

  // Assumed on the server so the button renders in the SSR output, checked once mounted
  const supported = ref(true)
  /** The microphone is open and audio is being streamed. */
  const recording = ref(false)
  /** Waiting for the final transcript after the recording stopped. */
  const finalizing = ref(false)
  /** Normalized input volume between 0 and 1 while recording. */
  const level = ref(0)
  /** Transcript of what was said so far. */
  const transcript = ref('')
  /** Error raised while recording, the session is cancelled when it is set. */
  const error = ref<Error | null>(null)

  let session: Session | null = null
  let finalizingSession: Session | null = null
  let starting = false
  let cancelled = false

  onMounted(() => {
    supported.value = isDictationSupported()
  })

  async function consume(current: Session) {
    try {
      for await (const part of current.result.fullStream) {
        if (part.type === 'transcript-delta') {
          current.partial += part.delta
        } else if (part.type === 'transcript-partial') {
          current.partial = part.text
        } else if (part.type === 'transcript-final') {
          current.finals.push(part.text)
          current.partial = ''
        } else if (part.type === 'error') {
          throw part.error
        }

        if (session === current) {
          transcript.value = [...current.finals, current.partial].filter(Boolean).join(' ').trim()
        }
      }
    } catch (cause) {
      if (session === current && !current.abort.signal.aborted) {
        error.value = cause instanceof Error ? cause : new Error(String(cause))
        cancel()
      }
    }
  }

  function release(current: Session) {
    clearTimeout(current.timeout)
    current.processor.onaudioprocess = null
    current.processor.disconnect()
    current.source.disconnect()
    current.audioContext.close().catch(() => {})
    current.stream.getTracks().forEach(track => track.stop())
    try {
      current.audio.close()
    } catch {
      // already closed
    }
    recording.value = false
    level.value = 0
  }

  /**
   * Open the microphone and start streaming.
   * `onMaxDuration` is called when the recording hits its time limit, as if the user stopped it.
   */
  async function start(options: { onMaxDuration?: () => void } = {}) {
    if (session || starting) return

    starting = true
    cancelled = false
    error.value = null
    transcript.value = ''

    const abort = new AbortController()

    try {
      await open(abort, options)
    } finally {
      starting = false
    }
  }

  async function open(abort: AbortController, { onMaxDuration }: { onMaxDuration?: () => void }) {
    const { token } = await $fetch<{ token: string }>('/api/transcription/token', {
      method: 'POST',
      headers: { [headerName]: csrf }
    })
    if (cancelled) return

    // Open the transcription stream first so the WebSocket handshake overlaps the microphone setup
    let controller!: ReadableStreamDefaultController<string>
    const audio = new ReadableStream<string>({
      start(c) {
        controller = c
      }
    })

    const model = createGateway({ apiKey: token }).experimental_transcription(TRANSCRIPTION_MODEL)
    const result = streamTranscribe({
      model,
      audio,
      inputAudioFormat: { type: 'audio/pcm', rate: SAMPLE_RATE },
      abortSignal: abort.signal
    })

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((cause: Error) => {
      abort.abort()
      throw cause.name === 'NotAllowedError' ? new Error('Microphone access was denied') : cause
    })
    if (cancelled) {
      // Cancelled while the permission prompt was open
      abort.abort()
      stream.getTracks().forEach(track => track.stop())
      return
    }

    let audioContext: AudioContext | undefined
    let source: MediaStreamAudioSourceNode
    let processor: ScriptProcessorNode

    try {
      const context = audioContext = new AudioContext({ sampleRate: SAMPLE_RATE })
      source = context.createMediaStreamSource(stream)
      processor = context.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0)

        let sum = 0
        for (const sample of input) {
          sum += sample * sample
        }
        level.value = Math.min(1, Math.sqrt(sum / input.length) * 5)

        const samples = context.sampleRate === SAMPLE_RATE
          ? new Float32Array(input)
          : resampleAudio(new Float32Array(input), context.sampleRate, SAMPLE_RATE)
        controller.enqueue(encodeRealtimeAudio(samples))
      }
      // The processor must be connected to run, mute it so the microphone is not played back
      const silence = context.createGain()
      silence.gain.value = 0
      source.connect(processor)
      processor.connect(silence)
      silence.connect(context.destination)
    } catch (cause) {
      // The microphone is open and the transcription stream is connected, tear everything down
      abort.abort()
      audioContext?.close().catch(() => {})
      stream.getTracks().forEach(track => track.stop())
      throw cause
    }

    session = {
      stream,
      audioContext,
      source,
      processor,
      audio: controller,
      abort,
      result,
      finals: [],
      partial: '',
      timeout: setTimeout(() => onMaxDuration?.(), MAX_DURATION)
    }
    recording.value = true

    consume(session)
  }

  /** Stop recording and resolve with the final transcript. */
  async function stop(): Promise<string> {
    const current = session
    if (!current) return ''

    session = null
    finalizingSession = current
    release(current)
    finalizing.value = true

    try {
      const text = await current.result.text
      return current.abort.signal.aborted ? '' : text.trim()
    } catch (cause) {
      if (current.abort.signal.aborted) return ''
      throw cause
    } finally {
      finalizingSession = null
      finalizing.value = false
      transcript.value = ''
    }
  }

  /** Stop recording and discard the transcript, or drop a pending final transcript. */
  function cancel() {
    cancelled = true
    finalizingSession?.abort.abort()
    const current = session
    if (!current) return

    session = null
    current.abort.abort()
    release(current)
    transcript.value = ''
  }

  onScopeDispose(cancel)

  return {
    supported,
    recording,
    finalizing,
    level,
    transcript,
    error,
    start,
    stop,
    cancel
  }
}
