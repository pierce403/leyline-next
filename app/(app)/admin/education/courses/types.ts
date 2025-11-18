import type { EducationStatus, MembershipLevel, LessonContentType } from "@prisma/client";

export type CourseModuleWithLessons = {
  id: string;
  moduleId: string;
  courseId: string;
  sortOrder: number;
  module: {
    id: string;
    name: string;
    description: string | null;
    lessons: {
      id: string;
      lessonId: string;
      sortOrder: number;
      lesson: {
        id: string;
        name: string;
        description: string | null;
        contentType: LessonContentType;
        content: string | null;
      };
    }[];
  };
};

export type SelectedCourseModalData = {
  id: string;
  name: string;
  description: string | null;
  status: EducationStatus;
  requiredLevel: MembershipLevel;
  importSummary?: {
    message: string;
    hasMissingComponents: boolean;
  } | null;
  modulesWithLessons: CourseModuleWithLessons[];
};

export type CourseOutlineModal = {
  id: string;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
  requiredLevel: MembershipLevel;
  createdAt: string;
  modules: CourseModuleWithLessons[];
};
