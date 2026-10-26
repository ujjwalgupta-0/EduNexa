"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, LayoutDashboard, UsersRound } from "lucide-react";
import BrandLink from "../BrandLink";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/student/courses" },
  { label: "Quizzes", icon: ClipboardList, href: "/student/quizzes" },
  { label: "Parent access", icon: UsersRound, href: "/student/parent-link" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="flex h-[72px] items-center border-b border-stone-200 px-6">
        <BrandLink size={34} />
      </div>
      <nav aria-label="Student workspace" className="flex-1 px-4 py-6">
        <p className="ui-eyebrow px-3">Learning</p>
        <div className="mt-4 space-y-1">
          {navigation.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? "bg-amber-50 text-amber-900" : "text-gray-600 hover:bg-amber-50 hover:text-gray-950"}`}><Icon size={18} strokeWidth={1.8} />{label}</Link>;
          })}
        </div>
      </nav>
      <p className="border-t border-stone-200 px-6 py-4 text-xs text-stone-400">Your learning space</p>
    </aside>
  );
}
