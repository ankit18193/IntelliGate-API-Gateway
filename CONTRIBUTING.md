# Contributing to IntelliGate

Thank you for your interest in contributing!

## Architecture Rules
1. **Clean Architecture**: `packages/core` MUST NOT depend on `packages/store-*` or `packages/providers`. Core dictates interfaces; Adapters implement them.
2. **SDK Purity**: `packages/sdk` MUST NOT contain any business logic or routing logic. It is strictly a networking and serialization wrapper.
3. **No Circular Dependencies**: Ensure `packages/shared` remains at the bottom of the dependency graph.

## Pull Requests
- Use Conventional Commits (`feat(sdk): ...`, `fix(core): ...`).
- Ensure all packages build: `npm run build`.
- Ensure tests pass: `npm run test` (Coming soon).

## Local Environment
IntelliGate uses NPM Workspaces. Do not use Yarn or PNPM to maintain consistency.
```bash
npm install
npm run dev -w @intelligate/backend
```
