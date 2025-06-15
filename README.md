# RSCH - Research Paper Management

A modern web application for managing and exploring academic papers with citations and references from Semantic Scholar.

## Features

- 📚 **Multiple Libraries**: Organize papers into separate libraries
- 🔍 **Search Papers**: Search academic papers using Semantic Scholar API
- 📊 **Citation Metrics**: View citation counts and calculate citescores
- 🔗 **References & Citations**: Explore paper relationships and networks
- 💾 **Persistent Storage**: Data stored locally in browser storage
- 🎯 **Smart Filtering**: Filter papers by year, venue, and search terms
- 🔄 **Retry Mechanism**: Robust error handling with retry functionality

## Getting Started

### Development

First, install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

To build for production:

```bash
npm run build
```

This creates an optimized static export in the `out` directory.

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source

2. **Push to main branch** - the GitHub Actions workflow will automatically:
   - Build the application
   - Deploy to GitHub Pages
   - Make it available at `https://username.github.io/rsch2`

The deployment workflow is configured in `.github/workflows/deploy.yml` and runs on every push to the main branch.

### Manual Deployment

You can also deploy the static files manually:

```bash
npm run build
# Upload the contents of the 'out' directory to your hosting provider
```

## Technology Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Semantic Scholar API** - Academic paper data source

## Project Structure

```
├── app/                 # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── .github/workflows/  # GitHub Actions workflows
```
