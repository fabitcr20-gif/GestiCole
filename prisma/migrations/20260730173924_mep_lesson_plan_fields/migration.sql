-- AlterTable
ALTER TABLE "lesson_plans" ADD COLUMN     "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "asignatura" TEXT,
ADD COLUMN     "centroEducativo" TEXT,
ADD COLUMN     "competencias" TEXT,
ADD COLUMN     "cursoLectivo" INTEGER DEFAULT 2026,
ADD COLUMN     "direccionRegional" TEXT,
ADD COLUMN     "duaSupports" JSONB DEFAULT '[]',
ADD COLUMN     "googleDocId" TEXT,
ADD COLUMN     "groupCharacteristics" TEXT,
ADD COLUMN     "institutionalContext" TEXT,
ADD COLUMN     "learningStyles" TEXT,
ADD COLUMN     "nivelCiclo" TEXT,
ADD COLUMN     "pedagogicalApproach" TEXT,
ADD COLUMN     "periodicidad" TEXT,
ADD COLUMN     "reflection" TEXT,
ADD COLUMN     "socialContext" TEXT,
ADD COLUMN     "specialEducationNeeds" TEXT;

-- CreateTable
CREATE TABLE "lesson_plan_documents" (
    "id" TEXT NOT NULL,
    "lessonPlanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "extractedText" TEXT,
    "driveFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_plan_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lesson_plan_documents_lessonPlanId_idx" ON "lesson_plan_documents"("lessonPlanId");

-- AddForeignKey
ALTER TABLE "lesson_plan_documents" ADD CONSTRAINT "lesson_plan_documents_lessonPlanId_fkey" FOREIGN KEY ("lessonPlanId") REFERENCES "lesson_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
