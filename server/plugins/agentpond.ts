export default defineNitroPlugin(async () => {
  if (process.env.AGENTPOND_ENABLED !== 'true' || !process.env.VERCEL_PROJECT_ID) {
    return
  }

  const [
    { createVercelSpanExporter },
    { OpenTelemetry },
    { isOpenInferenceSpan, OpenInferenceSimpleSpanProcessor },
    { NodeTracerProvider },
    { registerTelemetry }
  ] = await Promise.all([
    import('@agentpond/vercel'),
    import('@ai-sdk/otel'),
    import('@arizeai/openinference-vercel'),
    import('@opentelemetry/sdk-trace-node'),
    import('ai')
  ])

  const provider = new NodeTracerProvider({
    spanProcessors: [
      new OpenInferenceSimpleSpanProcessor({
        exporter: createVercelSpanExporter(),
        spanFilter: isOpenInferenceSpan,
        reparentOrphanedSpans: true
      })
    ]
  })

  provider.register()
  registerTelemetry(new OpenTelemetry())
})
