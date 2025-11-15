-- CreateTable
CREATE TABLE "EducationImportLog" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "details" TEXT,
    "manifestJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EducationImportLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EducationImportLog" ADD CONSTRAINT "EducationImportLog_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

