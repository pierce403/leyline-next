-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('INACTIVE', 'SUSPENDED', 'ACTIVE');

-- CreateEnum
CREATE TYPE "UserAccessType" AS ENUM ('NONE', 'USER', 'PRO', 'SALES', 'OWNER', 'CONTENT_ADMIN', 'ADMIN', 'SUPER_ADMIN', 'MASTER');

-- CreateEnum
CREATE TYPE "MembershipLevel" AS ENUM ('FREE', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');

-- CreateEnum
CREATE TYPE "EducationStatus" AS ENUM ('DEVELOPMENT', 'FREE', 'BASIC', 'PRO', 'DELETED');

-- CreateEnum
CREATE TYPE "ModuleStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "LessonStatus" AS ENUM ('ACTIVE', 'DELETED');

-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('NONE', 'IMAGE', 'VIDEO', 'HTML', 'TEXT', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "LessonProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "auth0UserId" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "photoUrl" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "accessType" "UserAccessType" NOT NULL DEFAULT 'NONE',
    "investmentGoals" TEXT[],
    "investmentStrategies" TEXT[],
    "investmentPreferences" TEXT[],
    "investmentCriteria" TEXT[],
    "professionalExperience" TEXT,
    "education" TEXT,
    "awards" TEXT,
    "isAccredited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "plan" "MembershipLevel" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationProgram" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "EducationStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationCourse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "EducationStatus" NOT NULL DEFAULT 'DEVELOPMENT',
    "coverImageUrl" TEXT,
    "requiredLevel" "MembershipLevel" NOT NULL DEFAULT 'FREE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationModule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ModuleStatus" NOT NULL DEFAULT 'ACTIVE',
    "coverImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLesson" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "LessonStatus" NOT NULL DEFAULT 'ACTIVE',
    "contentType" "LessonContentType" NOT NULL DEFAULT 'NONE',
    "content" TEXT,
    "courseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EducationLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramCourse" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProgramCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ModuleLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationLink" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "EducationLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEducationProgram" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "percentCompleted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latestActionTimestamp" TIMESTAMP(3),

    CONSTRAINT "UserEducationProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEducationCourse" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "percentCompleted" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "latestActionTimestamp" TIMESTAMP(3),

    CONSTRAINT "UserEducationCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEducationLesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "LessonProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "lastViewedTimestamp" TIMESTAMP(3),

    CONSTRAINT "UserEducationLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "notes" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Investment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "investmentType" TEXT NOT NULL,
    "owned" DOUBLE PRECISION NOT NULL,
    "shares" BOOLEAN NOT NULL DEFAULT true,
    "mock" BOOLEAN NOT NULL DEFAULT false,
    "value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Investment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentTransaction" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION,
    "occurredAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentReminder" (
    "id" TEXT NOT NULL,
    "investmentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "dueAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "idx_user_auth0_user_id" ON "User"("auth0UserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_alias_key" ON "User"("alias");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "idx_subscription_stripe_subscription_id" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProgramCourse_programId_courseId_key" ON "ProgramCourse"("programId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseModule_courseId_moduleId_key" ON "CourseModule"("courseId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleLesson_moduleId_lessonId_key" ON "ModuleLesson"("moduleId", "lessonId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEducationProgram_userId_programId_key" ON "UserEducationProgram"("userId", "programId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEducationCourse_userId_courseId_key" ON "UserEducationCourse"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEducationLesson_userId_lessonId_key" ON "UserEducationLesson"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationLesson" ADD CONSTRAINT "EducationLesson_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_programId_fkey" FOREIGN KEY ("programId") REFERENCES "EducationProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramCourse" ADD CONSTRAINT "ProgramCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "EducationModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleLesson" ADD CONSTRAINT "ModuleLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "EducationModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleLesson" ADD CONSTRAINT "ModuleLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "EducationLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EducationLink" ADD CONSTRAINT "EducationLink_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducationProgram" ADD CONSTRAINT "UserEducationProgram_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducationProgram" ADD CONSTRAINT "UserEducationProgram_programId_fkey" FOREIGN KEY ("programId") REFERENCES "EducationProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducationCourse" ADD CONSTRAINT "UserEducationCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducationCourse" ADD CONSTRAINT "UserEducationCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "EducationCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducationLesson" ADD CONSTRAINT "UserEducationLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEducationLesson" ADD CONSTRAINT "UserEducationLesson_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "EducationLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentTransaction" ADD CONSTRAINT "InvestmentTransaction_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentReminder" ADD CONSTRAINT "InvestmentReminder_investmentId_fkey" FOREIGN KEY ("investmentId") REFERENCES "Investment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
