# Nuxt AI Chatbot Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Full-featured AI Chatbot Nuxt application with authentication, chat history, multiple pages, collapsible sidebar, keyboard shortcuts, light & dark mode, command palette and more. Built using [Nuxt UI](https://ui.nuxt.com) components and integrated with [AI SDK](https://ai-sdk.dev) for a complete chat experience.

- [Live demo](https://chat-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/docs/getting-started/installation/nuxt)

<a href="https://chat-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui.nuxt.com/assets/templates/nuxt/chat-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui.nuxt.com/assets/templates/nuxt/chat-light.png">
    <img alt="Nuxt AI Chatbot Template" src="https://ui.nuxt.com/assets/templates/nuxt/chat-light.png">
  </picture>
</a>

## Features

- ⚡️ **Streaming AI messages** powered by the [AI SDK](https://ai-sdk.dev)
- 🤖 **Multiple model support** via various AI providers with built-in AI Gateway support
- 🔐 **Authentication** via [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- 💾 **Chat history persistence** using SQLite database (Turso in production) and [Drizzle ORM](https://orm.drizzle.team)
- 🚀 **Easy deploy** to Vercel with zero configuration

## Quick Start

```bash
npm create nuxt@latest -- -t ui/chat
```

## Deploy your own

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-name=chat&repository-url=https%3A%2F%2Fgithub.com%2Fnuxt-ui-templates%2Fchat&env=NUXT_SESSION_PASSWORD,NUXT_OAUTH_GITHUB_CLIENT_ID,NUXT_OAUTH_GITHUB_CLIENT_SECRET&products=%5B%7B%22type%22%3A%22integration%22%2C%22protocol%22%3A%22storage%22%2C%22productSlug%22%3A%22database%22%2C%22integrationSlug%22%3A%22tursocloud%22%7D%5D&demo-image=https%3A%2F%2Fui.nuxt.com%2Fassets%2Ftemplates%2Fnuxt%2Fchat-dark.png&demo-url=https%3A%2F%2Fchat-template.nuxt.dev%2F&demo-title=Nuxt%20Chat%20Template&demo-description=An%20AI%20chatbot%20template%20to%20build%20your%20own%20chatbot%20powered%20by%20Nuxt%20MDC%20and%20Vercel%20AI%20SDK.)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

Run database migrations:

```bash
pnpm db:migrate
```

### AI Integration

This template uses the [Vercel AI SDK](https://ai-sdk.dev/) for streaming AI responses with support for multiple providers through [Vercel AI Gateway](https://vercel.com/docs/ai-gateway).

Set your AI provider configuration in `.env`:

```bash
# AI Configuration via Vercel AI Gateway (unified API for all providers)
AI_GATEWAY_API_KEY=<your-vercel-ai-gateway-api-key>
```

> [!TIP]
> With Vercel AI Gateway, you don't need individual API keys for OpenAI, Anthropic, etc. The AI Gateway provides a unified API to access hundreds of models through a single endpoint with automatic load balancing, fallbacks, and spend monitoring.

### Authentication (Optional)

This template uses [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) for authentication with GitHub OAuth.

To enable authentication, [create a GitHub OAuth application](https://github.com/settings/applications/new) and set:

```bash
NUXT_OAUTH_GITHUB_CLIENT_ID=<your-github-oauth-app-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<your-github-oauth-app-client-secret>
NUXT_SESSION_PASSWORD=<your-password-minimum-32-characters>
```

### Blob Storage (Optional)

This template uses [NuxtHub Blob](https://hub.nuxt.com/docs/features/blob) for file uploads, which supports multiple storage providers:

- **Local filesystem** (default for development)
- **Vercel Blob** (auto-configured when deployed to Vercel)
- **Cloudflare R2** (auto-configured when deployed to Cloudflare)
- **Amazon S3** (with manual configuration)

For **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)**, assign a Blob Store to your project from the Vercel dashboard (Project → Storage), then set the token for local development:

```bash
BLOB_READ_WRITE_TOKEN=<your-vercel-blob-token>
```

For **S3-compatible storage**, set:

```bash
S3_ACCESS_KEY_ID=<your-access-key-id>
S3_SECRET_ACCESS_KEY=<your-secret-access-key>
S3_BUCKET=<your-bucket-name>
S3_REGION=<your-region>
```

> [!NOTE]
> Without configuration, files are stored locally in `.data/hub/blob` during development.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
