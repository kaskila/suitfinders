# SuitFinders Engineering Guidelines

## Project

SuitFinders is a full-stack platform for discovering, sourcing,
selling, and custom-ordering suits in Zambia.

The initial goal is to build a focused MVP that validates the
core customer experience before introducing unnecessary complexity.

## Technology

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Zod
- Git/GitHub

Additional dependencies must have a clear justification.

## Engineering Principles

- Prefer Server Components by default.
- Use Client Components only when client-side interactivity is required.
- Keep business logic separate from presentation.
- Validate all external input.
- Never expose secrets or credentials.
- Use TypeScript strictly.
- Prefer small, composable functions.
- Avoid premature abstraction.
- Avoid unnecessary dependencies.
- Follow accessibility best practices.
- Follow responsive design principles.
- Optimize for maintainability and readability.

## Architecture

Use the Next.js App Router.

Keep responsibilities separated:

- UI components handle presentation.
- Server-side code handles data access and business operations.
- Validation schemas define and validate external input.
- Database access is centralized.
- Authentication and authorization are enforced server-side.
- No component may import from `src/lib/data/fixtures/`. Components only
  call the async getters in `src/lib/data/*` — that boundary is what lets
  fixtures be swapped for Prisma queries without touching any component.

## Security

Never:

- hardcode secrets
- expose environment variables containing secrets to the client
- trust client-side authorization
- directly trust user input
- disable security checks to make code work

## Development Workflow

Before modifying code:

1. Inspect the relevant files.
2. Understand the existing implementation.
3. Identify dependencies and potential side effects.
4. Propose the smallest reasonable change.

After modifying code:

1. Run the relevant checks.
2. Verify TypeScript.
3. Verify linting.
4. Test affected functionality.
5. Report changed files and remaining issues.

## Scope Control

Do not:

- modify unrelated files
- rewrite working code unnecessarily
- introduce libraries without justification
- build features that were not requested
- create abstractions before they are needed

Prefer the simplest solution that satisfies the requirement.

## AI Development Rules

Claude Code is an engineering assistant, not an autonomous product owner.

Do not implement large features from vague requirements.

For significant changes:

1. Analyze the existing code.
2. Explain the proposed approach.
3. Wait for approval when the change is architectural or substantial.
4. Implement the smallest coherent change.
5. Verify the implementation.

When uncertain, ask rather than inventing requirements.

## Testing

Critical business logic must eventually have automated tests.

User-facing flows should have integration or end-to-end tests where appropriate.

Do not claim something works without verifying it.

## Git

Use small, meaningful commits.

Commit messages should describe the change clearly.

Examples:

feat: initialize application shell
feat: add product catalog
fix: handle missing product
refactor: simplify product query

Never commit:

- `.env.local`
- API keys
- passwords
- private credentials
