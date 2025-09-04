# Nuxt AI Chatbot Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

Full-featured AI Chatbot Nuxt application with authentication, chat history, multiple pages, collapsible sidebar, keyboard shortcuts, light & dark mode, command palette and more. Built using [Nuxt UI](https://ui.nuxt.com) components and integrated with [AI SDK v5](https://sdk.vercel.ai) for a complete chat experience.

- [Live demo](https://chat-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/getting-started/installation/nuxt)

<a href="https://chat-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://ui4.nuxt.com/assets/templates/nuxt/chat-dark.png">
    <source media="(prefers-color-scheme: light)" srcset="https://ui4.nuxt.com/assets/templates/nuxt/chat-light.png">
    <img alt="Nuxt AI Chatbot Template" src="https://ui4.nuxt.com/assets/templates/nuxt/chat-light.png">
  </picture>
</a>

## Features

- ⚡️ **Streaming AI messages** powered by the [AI SDK v5](https://sdk.vercel.ai)
- 🤖 **Multiple model support** via various AI providers with built-in AI Gateway support
- 🔐 **Authentication** via [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- 💾 **Chat history persistence** using PostgreSQL database and [Drizzle ORM](https://orm.drizzle.team)
- 🚀 **Easy deploy** to Vercel with zero configuration

## Quick Start

```bash
npx nuxi@latest init -t github:nuxt-ui-templates/chat
```

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

Set up your environment variables by creating a `.env` file:

```env
# Database
DATABASE_URL=<your-postgresql-database-url>

# GitHub OAuth (optional, for authentication)
NUXT_OAUTH_GITHUB_CLIENT_ID=<your-github-oauth-app-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<your-github-oauth-app-client-secret>

# AI Configuration via Vercel AI Gateway (unified API for all providers)
AI_GATEWAY_API_KEY=<your-vercel-ai-gateway-api-key>
```

> [!TIP]
> With [Vercel AI Gateway](https://vercel.com/docs/ai-gateway), you don't need individual API keys for OpenAI, Anthropic, etc. The AI Gateway provides a unified API to access hundreds of models through a single endpoint with automatic load balancing, fallbacks, and spend monitoring.

To add authentication with GitHub, you need to [create a GitHub OAuth application](https://github.com/settings/applications/new).

Run database migrations:

```bash
pnpm db:migrate
```

## Development

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

Deploy to Vercel:

```bash
npx vercel
```

Or connect your repository to Vercel for automatic deployments:

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Configure your environment variables in the Vercel dashboard
4. Deploy automatically on every push

> [!NOTE]
> Make sure to configure your PostgreSQL database connection and run migrations in your production environment.

The application is configured to use [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) which provides:

- **Unified API**: Access hundreds of AI models through a single endpoint
- **High Reliability**: Automatic retries and fallbacks between providers
- **Spend Monitoring**: Track usage and set budgets across all providers
- **Load Balancing**: Distribute requests for optimal performance

Simply configure your `AI_GATEWAY_API_KEY` in your Vercel environment variables for production use.

## AI Gateway Setup

1. Create a Vercel account at [vercel.com](https://vercel.com)
2. Navigate to your [AI Gateway settings](https://vercel.com/dashboard/ai-gateway)
3. Generate an API key for your project
4. Add the key to your environment variables as `AI_GATEWAY_API_KEY`

The AI Gateway automatically handles authentication with all supported AI providers including OpenAI, Anthropic, Google, xAI, and many others.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
