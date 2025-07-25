# Nova - AI-Powered Email Client

Nova is a TypeScript monorepo using Turborepo with Gmail integration and a modern web interface.

## Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all packages
pnpm build
```

## Code Formatting

This project uses Prettier for consistent code formatting across all packages.

```bash
# Format all files
pnpm format

# Check formatting without fixing
pnpm format:check

# Fix formatting issues
pnpm format:fix
```

The Prettier configuration is set to:

- 80 character line width
- 2 space indentation
- Semicolons enabled
- Double quotes for strings
- Trailing commas in multiline structures
- Automatic formatting on save in VS Code

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Tailwind

Your `tailwind.config.ts` and `globals.css` are already set up to use the components from the `ui` package.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@nova/ui/components/button";
```
