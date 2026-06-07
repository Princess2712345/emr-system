#!/bin/sh
# Production startup: run migrations, recover from stale "failed" records, then boot Nitro.

MIGRATE_FAILED=0
npx prisma migrate deploy > /tmp/migrate-out.log 2>&1 || MIGRATE_FAILED=1

if [ "$MIGRATE_FAILED" -eq 1 ]; then
  cat /tmp/migrate-out.log

  if grep -q "P3009\|failed migrations" /tmp/migrate-out.log; then
    echo "==> Recovering from failed migration state (P3009)..."

    # Prisma logs the failed migration name in the error output
    FAILED_MIG=$(grep -oE '[0-9]{14}_[a-zA-Z0-9_]+' /tmp/migrate-out.log | head -1)

    if [ -n "$FAILED_MIG" ]; then
      echo "==> Resolving: $FAILED_MIG"
      npx prisma migrate resolve --rolled-back "$FAILED_MIG" 2>/dev/null || \
      npx prisma migrate resolve --applied "$FAILED_MIG" 2>/dev/null || true

      echo "==> Retrying migrations..."
      npx prisma migrate deploy
    else
      echo "==> Could not detect failed migration name."
      exit 1
    fi
  else
    exit 1
  fi
fi

echo "==> Migrations complete. Starting server..."
exec node .output/server/index.mjs
