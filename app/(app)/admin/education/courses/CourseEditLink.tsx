'use client';

import Link from "next/link";

type CourseEditLinkProps = {
  courseId: string;
};

export function CourseEditLink({ courseId }: CourseEditLinkProps) {
  const href = `/admin/education/courses?courseId=${courseId}`;

  const handleClick = () => {
    // Keep default navigation behavior, just add logging.
    console.log("[AdminCourses] Edit clicked", {
      courseId,
      href,
      time: new Date().toISOString(),
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="rounded border border-gray-300 px-2 py-0.5 font-semibold text-gray-700 hover:bg-gray-50"
    >
      Edit
    </Link>
  );
}
