'use client';

import { useRouter } from "next/navigation";
import Link from "next/link";

type CourseInfoLinkProps = {
  courseId: string;
  children: React.ReactNode;
};

export function CourseInfoLink({ courseId, children }: CourseInfoLinkProps) {
  const router = useRouter();
  const href = `/admin/education/courses?infoCourseId=${courseId}`;

  const handleClick = () => {
    console.log("[AdminCourses] Info clicked", {
      courseId,
      href,
      time: new Date().toISOString(),
    });
    router.push(href);
    router.refresh();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="font-semibold text-gray-900 hover:text-leyline-primary"
    >
      {children}
    </Link>
  );
}
