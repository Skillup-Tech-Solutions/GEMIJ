-- CreateTable
CREATE TABLE "plagiarism_checks" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "similarityScore" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'INTERNAL',
    "matchedSources" JSONB,
    "reportUrl" TEXT,
    "rawResponse" JSONB,
    "errorMessage" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkedBy" TEXT,

    CONSTRAINT "plagiarism_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_assessments" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "structureScore" INTEGER NOT NULL,
    "formattingScore" INTEGER NOT NULL,
    "readabilityScore" INTEGER NOT NULL,
    "completenessScore" INTEGER NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "abstractLength" INTEGER NOT NULL,
    "referenceCount" INTEGER NOT NULL,
    "figureCount" INTEGER NOT NULL,
    "tableCount" INTEGER NOT NULL,
    "issues" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assessedBy" TEXT,

    CONSTRAINT "quality_assessments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "plagiarism_checks" ADD CONSTRAINT "plagiarism_checks_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_assessments" ADD CONSTRAINT "quality_assessments_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
