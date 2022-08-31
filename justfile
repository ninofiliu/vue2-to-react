test:
  pnpm exec jest
tdd:
  pnpm exec jest --watch
generateExamples:
  pnpm exec tsx generateExamples.ts
  pnpm exec prettier --write examples.md
