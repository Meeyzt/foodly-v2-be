# foodly-v2-be

Production-grade backend foundation for Foodly v2.

## Tech Choice

- **NestJS + Fastify**
  - NestJS gives modular architecture (module/service/controller/domain), DI, testing, and scalable conventions.
  - Fastify provides better runtime performance than Express with low overhead.
- **Prisma + SQLite (dev default)**
  - Typed DB access, clean migration workflow, production-friendly datasource abstraction.

## Implemented Foundation

- Modular structure:
  - `src/modules/health` (health endpoint)
  - `src/modules/auth` (register/login/me + JWT strategy)
  - `src/database` (Prisma service/module)
  - `src/config` (typed config + env validation)
  - `src/common` (global exception filter + response transform interceptor)
- Global validation (`class-validator` + `ValidationPipe`)
- Global error handling (standardized error payload)
- Auth baseline (JWT + Passport)
- Health endpoint (`GET /api/health`)
- DB layer + migration infrastructure (`prisma/`)
- Test setup (unit + e2e)
- Lint / test / build scripts

## Run

```bash
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name init
npm run start:dev
```

## Quality Commands

```bash
npm run lint
npm run test
npm run test:e2e
npm run build
```
