# Nuxt AI Chatbot Template

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Deploy to NuxtHub](https://img.shields.io/badge/Deploy%20to-NuxtHub-00DC82?logo=nuxt&labelColor=020420)](https://hub.nuxt.com/new?repo=nuxt-ui/chat)

Full-featured AI Chatbot Nuxt application with authentication, chat history, multiple pages, collapsible sidebar, keyboard shortcuts, light & dark mode, command palette and more. Built using [Nuxt UI](https://ui.nuxt.com) components and integrated with [Workers AI](https://ai.cloudflare.com) for a complete chat experience.

- [Live demo](https://chat-template.nuxt.dev/)
- [Documentation](https://ui.nuxt.com/getting-started/installation/nuxt)

<a href="https://chat-template.nuxt.dev/" target="_blank">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2NoYXQtdGVtcGxhdGUubnV4dC5kZXYiLCJpYXQiOjE3NDI4NDY2ODB9.n4YCsoNz8xatox7UMoYZFNo7iS1mC_DT0h0A9cKRoTw.jpg?theme=dark">
    <source media="(prefers-color-scheme: light)" srcset="https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2NoYXQtdGVtcGxhdGUubnV4dC5kZXYiLCJpYXQiOjE3NDI4NDY2ODB9.n4YCsoNz8xatox7UMoYZFNo7iS1mC_DT0h0A9cKRoTw.jpg?theme=light">
    <img alt="Nuxt AI Chatbot Template" src="https://assets.hub.nuxt.com/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJodHRwczovL2NoYXQtdGVtcGxhdGUubnV4dC5kZXYiLCJpYXQiOjE3NDI4NDY2ODB9.n4YCsoNz8xatox7UMoYZFNo7iS1mC_DT0h0A9cKRoTw.jpg">
  </picture>
</a>

## Features

- ⚡️ **Streaming AI messages** powered by the [Vercel AI SDK ](https://sdk.vercel.ai)
- 🤖 **Multiple model support** via [Workers AI](https://ai.cloudflare.com) with support for [AI Gateway](https://developers.cloudflare.com/ai-gateway/)
- 🔐 **Authentication** via [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
- 💾 **Chat history persistence** using [NuxtHub database](https://hub.nuxt.com/docs/features/database) and [Drizzle ORM](https://orm.drizzle.team)
- 🚀 **One-click deploy** to your Cloudflare account with NuxtHub: [deploy now](https://hub.nuxt.com/new?repo=nuxt-ui-pro/chat)

## Quick Start

```bash
npx nuxi@latest init -t github:nuxt-ui-pro/chat
```

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

Next, link a NuxtHub project (even if not deployed) to access AI models in development:

```bash
npx nuxthub link
```

> [!TIP]
> It works with free Cloudflare and NuxtHub accounts.

To add authentication with GitHub, you need to [create a GitHub OAuth application](https://github.com/settings/applications/new) and then fill the credentials in your `.env`:

```env
NUXT_OAUTH_GITHUB_CLIENT_ID=<your-github-oauth-app-client-id>
NUXT_OAUTH_GITHUB_CLIENT_SECRET=<your-github-oauth-app-client-secret>
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

Deploy to your Cloudflare account with zero configuration:

```bash
npx nuxthub deploy
```

> [!NOTE]
> NuxtHub will automatically spawn a D1 database and apply the database migrations when deploying your project.

Optionally, you can create a [Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/) to have usage analytics and the ability to cache response to reduce costs. Once created, you can add the `NUXT_CLOUDFLARE_GATEWAY_ID` environment variable with the named of your gateway.

## Renovate integration

Install [Renovate GitHub app](https://github.com/apps/renovate/installations/select_target) on your repository and you are good to go.
