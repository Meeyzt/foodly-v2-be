-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "segmentType" TEXT NOT NULL,
    "segmentMinOrderCount" INTEGER,
    "segmentMinTotalSpent" REAL,
    "segmentDormantDays" INTEGER,
    "discountRate" REAL,
    "startsAt" DATETIME NOT NULL,
    "endsAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Campaign_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Campaign_branchId_isActive_idx" ON "Campaign"("branchId", "isActive");

-- CreateIndex
CREATE INDEX "Campaign_branchId_startsAt_endsAt_idx" ON "Campaign"("branchId", "startsAt", "endsAt");
