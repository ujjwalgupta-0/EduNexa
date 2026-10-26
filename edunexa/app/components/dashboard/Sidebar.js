"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, BookOpen, ClipboardCheck, ClipboardList, LayoutDashboard, MessageCircleQuestion, UsersRound } from "lucide-react";
import BrandLink from "../BrandLink";
import DoubtSolver from "@/app/student/doubt-solver/DoubtSolver";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
  { label: "My Courses", icon: BookOpen, href: "/student/courses" },
  { label: "Assignments", icon: ClipboardCheck, href: "/student/assignments" },
  { label: "Quizzes", icon: ClipboardList, href: "/student/quizzes" },
  { label: "Parent access", icon: UsersRound, href: "/student/parent-link" },
];

export default function Sidebar({ isConfigured = false, assignmentContext: initialAssignmentContext = null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [assignmentContext, setAssignmentContext] = useState(initialAssignmentContext);

  useEffect(() => {
    function openTutor(event) {
      if (event.detail?.assignmentContext !== undefined) {
        setAssignmentContext(event.detail.assignmentContext);
      }
      setOpen(true);
    }
    window.addEventListener("edunexa:open-ai-tutor", openTutor);
    return () => window.removeEventListener("edunexa:open-ai-tutor", openTutor);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex h-[72px] items-center border-b border-stone-200 px-6"><BrandLink size={34} /></div>
        <nav aria-label="Student workspace" className="flex-1 px-4 py-6">
          <p className="ui-eyebrow px-3">Learning</p>
          <div className="mt-4 space-y-1">
            {navigation.map(({ label, icon: Icon, href }) => {
              const active = pathname === href;
              return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition ${active ? "bg-amber-50 text-amber-900" : "text-gray-600 hover:bg-amber-50 hover:text-gray-950"}`}><Icon size={18} strokeWidth={1.8} />{label}</Link>;
            })}
            <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="student-ai-tutor" className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-semibold text-gray-600 transition hover:bg-amber-50 hover:text-gray-950"><MessageCircleQuestion size={18} strokeWidth={1.8} />AI doubt solver</button>
          </div>
        </nav>
        <p className="border-t border-stone-200 px-6 py-4 text-xs text-stone-400">Your learning space</p>
      </aside>

      <button type="button" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="student-ai-tutor" className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-stone-900 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-stone-700 lg:hidden"><Bot size={18} />Ask AI</button>

      <div className={`fixed inset-0 z-[60] ${open ? "visible" : "invisible pointer-events-none"}`} aria-hidden={!open}>
        <button type="button" tabIndex={open ? 0 : -1} aria-label="Close AI tutor" onClick={() => setOpen(false)} className="absolute inset-0 h-full w-full cursor-default bg-stone-950/35 backdrop-blur-[1px]" />
        <section id="student-ai-tutor" role="dialog" aria-modal={open ? "true" : undefined} aria-label="EduNexa AI tutor" className={`absolute inset-y-0 left-0 flex w-full max-w-[440px] flex-col border-r border-stone-200 bg-white shadow-2xl ${open ? "animate-[doubt-drawer-in_220ms_ease-out]" : "translate-x-[-100%]"}`}>
          <DoubtSolver isConfigured={isConfigured} assignmentContext={assignmentContext} mode="drawer" isOpen={open} onClose={() => setOpen(false)} />
        </section>
      </div>
    </>
  );
}
