# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Database (PostgreSQL + Prisma)

Patient records live in the `Patient` table and are linked to portal logins in `User`.

1. Copy `.env.example` to `.env` and set `DATABASE_URL`.
2. Apply schema and migrations:

```bash
npm run db:generate
npm run db:migrate
```

Or, for local development without migration history:

```bash
npm run db:push
```

3. Optional sample patients:

```bash
npm run db:seed
```

Default seed logins (password `Patient123!`):

- `penny.rose@patient.emr` / MRN `MRN-1001`
- `juan.delacruz@patient.emr` / MRN `MRN-1002`

Staff can register more patients from **Dashboard → Registration** (`POST /api/patients`).

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
