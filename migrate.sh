set -a
source .env
export POSTGRES_PRISMA_URL="$POSTGRES_URL_NON_POOLING"   # use the direct 5432 DSN
pnpm prisma migrate deploy --preview-feature

