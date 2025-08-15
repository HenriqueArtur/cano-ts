# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cano TS is a TypeScript library inspired by Elixir's pipe operator (`|>`), providing fluent API for composing sync and async functions in clean, readable pipelines. The library exports `pipe()` for async operations and `pipeSync()` for synchronous operations.

## Development Commands

### Building
- `pnpm run build` - Builds the core library package
- `pnpm run clean` - Removes dist directories

### Testing
- `pnpm run test` - Runs unit tests in watch mode (vitest)
- `pnpm run test:ci` - Runs tests once for CI
- `pnpm run test:build` - Tests the built library
- `pnpm run test:integration` - Runs integration tests against test app
- `pnpm run test:type` - Runs TypeScript type checking for all projects

### Linting & Formatting
- `pnpm run lint` - Runs Biome linting with auto-fix
- `pnpm run lint:ci` - Runs Biome linting without fixes (for CI)

### Documentation
- `pnpm run docs:dev` - Starts VitePress dev server
- `pnpm run docs:build` - Builds documentation
- `pnpm run docs:preview` - Previews built documentation

## Architecture

### Monorepo Structure
This is a pnpm workspace with the main library code in `packages/core/` and a test application in `packages/test-app/`. The root `package.json` orchestrates commands across packages using pnpm's workspace filtering.

### Core Library (`packages/core/`)
- **Main exports**: `pipe()` (async) and `pipeSync()` (sync) functions
- **Utility module**: `E` enum exports array utility functions (map, filter, reduce, etc.)

### Key Files
- `packages/core/src/index.ts` - Main pipe implementations (Pipe and PipeSync classes)
- `packages/core/src/enum.ts` - Array utility functions exported as `E`

### Build System
- Uses Rollup for bundling with multiple output formats (CJS, ESM, types)
- Builds to root `dist/` directory
- Supports both CommonJS and ESM exports
- TypeScript compilation with strict settings

### Testing Strategy
- Unit tests alongside source files (`*.spec.ts`)
- Build tests in `test/` directory verify the compiled library
- Integration tests use a separate test app that imports the built library
- Custom scripts prepare and run the test app with the latest build

### Code Quality
- Biome for linting and formatting (2-space indentation, 100 char line width)
- TypeScript with strict settings
- Husky for git hooks
- Changesets for version management