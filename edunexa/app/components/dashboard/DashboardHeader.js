"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, LayoutDashboard, LogOut, UsersRound } from "lucide-react";
import BrandLink from "../BrandLink";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
  { label: "Courses", icon: BookOpen, href: "/student/courses" },
  { label: "Quizzes", icon: ClipboardList, href: "/student/quizzes" },
  { label: "Parent access", icon: UsersRound, href: "/student/parent-link" },
];

export default function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-[#fbfaf7]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-7">
        <div className="flex min-w-0 items-center gap-5">
          <BrandLink size={30} className="lg:hidden" />
          <p className="hidden text-sm font-medium text-stone-500 lg:block">Student workspace</p>
          <nav aria-label="Quick navigation" className="hidden items-center gap-1 md:flex lg:hidden">
            {navigation.map(({ label, icon: Icon, href }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${pathname === href ? "bg-amber-100 text-amber-950" : "text-stone-600 hover:bg-stone-100"}`}><Icon size={14} />{label}</Link>)}
          </nav>
        </div>
        <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-stone-300 bg-white px-3.5 py-2 text-xs font-semibold text-stone-700 transition hover:border-amber-500 hover:text-stone-950 sm:text-sm"><LogOut size={15} />Sign out</button>
      </div>
      <nav aria-label="Student navigation" className="flex gap-1 overflow-x-auto border-t border-stone-100 px-4 py-2 md:hidden">
        {navigation.map(({ label, icon: Icon, href }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${pathname === href ? "bg-amber-100 text-amber-950" : "text-stone-600 hover:bg-stone-100"}`}><Icon size={14} />{label}</Link>)}
      </nav>
    </header>
  );
}
