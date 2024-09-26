-- CreateTable
CREATE TABLE "document" (
    "indexName" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "document_indexName_key" ON "document"("indexName");
