-- AlterTable
ALTER TABLE "products" ADD COLUMN     "category" TEXT;

-- Aktifkan extension pg_trgm jika belum ada
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Buat GIN index pada name dan description menggunakan gin_trgm_ops untuk pencarian ILIKE yang cepat
CREATE INDEX IF NOT EXISTS "product_search_gin_idx" ON "products" USING GIN ("name" gin_trgm_ops, "description" gin_trgm_ops);
