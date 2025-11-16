"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useTransition } from "react";

type CourseEditLinkProps = {
  courseId: string;
};

export function CourseEditLink({ courseId }: CourseEditLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const href = `/admin/education/courses?courseId=${courseId}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey
    ) {
      // Let the browser handle modified clicks (open in new tab/window).
      return;
    }

    event.preventDefault();

    console.log("[AdminCourses] Edit clicked", {
      courseId,
      href,
      time: new Date().toISOString(),
    });

    startTransition(() => {
      router.push(href);
      router.refresh();
    });
  };

  const className = `rounded border border-gray-300 px-2 py-0.5 font-semibold text-gray-700 hover:bg-gray-50 ${
    isPending ? "pointer-events-none opacity-60" : ""
  }`;

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {isPending ? "Loading…" : "Edit"}
    </Link>
  );
}
