"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Search,
  ShieldCheck,
  Users,
  UserRoundCheck,
} from "lucide-react";

import RoleRequests from "./RoleRequests";
import eduNexaIcon from "@/app/icon.png";

const sections = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "accounts", label: "All accounts", icon: Users },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "teachers", label: "Approved teachers", icon: UserRoundCheck },
  { id: "parents", label: "Approved parents", icon: ShieldCheck },
  { id: "requests", label: "Role requests", icon: UserRoundCheck },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "enrollments", label: "Enrollments", icon: CheckCircle2 },
];

const columns = {
  accounts: [
    { title: "Account", render: (row) => <><span className="font-semibold text-gray-900">{row.name || "Name not provided"}</span><span className="mt-1 block text-xs text-gray-500">{row.email || "No email"}</span></> },
    { title: "Role", render: (row) => <span className="capitalize">{row.role.toLowerCase()}</span> },
    { title: "Request", render: (row) => row.requestedRole ? <span className="capitalize">{row.requestedRole.toLowerCase()} pending</span> : <span className="text-gray-400">—</span> },
    { title: "Created", render: (row) => formatDate(row.createdAt) },
  ],
  students: [
    { title: "Student", render: (row) => <><span className="font-semibold text-gray-900">{row.name || "Name not provided"}</span><span className="mt-1 block text-xs text-gray-500">{row.email || "No email"}</span></> },
    { title: "Joined", render: (row) => formatDate(row.createdAt) },
  ],
  teachers: [
    { title: "Teacher", render: (row) => <><span className="font-semibold text-gray-900">{row.name || "Name not provided"}</span><span className="mt-1 block text-xs text-gray-500">{row.email || "No email"}</span></> },
    { title: "Courses", render: (row) => row.courseCount },
    { title: "Approved account", render: (row) => formatDate(row.updatedAt) },
  ],
  parents: [
    { title: "Parent", render: (row) => <><span className="font-semibold text-gray-900">{row.name || "Name not provided"}</span><span className="mt-1 block text-xs text-gray-500">{row.email || "No email"}</span></> },
    { title: "Linked students", render: (row) => row.studentCount },
    { title: "Approved account", render: (row) => formatDate(row.updatedAt) },
  ],
  courses: [
    { title: "Course", render: (row) => <><span className="font-semibold text-gray-900">{row.title}</span><span className="mt-1 block text-xs text-gray-500">{row.subject}</span></> },
    { title: "Teacher", render: (row) => <><span>{row.teacher.name || "Name not provided"}</span><span className="mt-1 block text-xs text-gray-500">{row.teacher.email || "No email"}</span></> },
    { title: "Students", render: (row) => row.studentCount },
    { title: "Created", render: (row) => formatDate(row.createdAt) },
  ],
  enrollments: [
    { title: "Student", render: (row) => <><span className="font-semibold text-gray-900">{row.student.name || "Name not provided"}</span><span className="mt-1 block text-xs text-gray-500">{row.student.email || "No email"}</span></> },
    { title: "Course", render: (row) => <><span>{row.course.title}</span><span className="mt-1 block text-xs text-gray-500">{row.course.subject}</span></> },
    { title: "Teacher", render: (row) => row.course.teacher.name || "Name not provided" },
    { title: "Enrolled", render: (row) => formatDate(row.createdAt) },
  ],
};

const formatDate = (value) => new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export default function AdminWorkspace({ admin, stats, accounts, teachers, parents, courses, enrollments, requests }) {
  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const datasets = { accounts, students: accounts.filter((item) => item.role === "STUDENT"), teachers, parents, courses, enrollments, requests };
  const section = sections.find((item) => item.id === activeSection) || sections[0];
  const rows = datasets[activeSection] || [];
  const query = search.trim().toLowerCase();
  const visibleRows = query ? rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query)) : rows;

  return (
    <div className="ui-page">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-gray-200 bg-[#fafaf9] lg:flex">
        <Link href="/admin" className="flex h-[68px] items-center gap-3 border-b border-gray-200 px-6">
          <Image src={eduNexaIcon} alt="" width={32} height={32} priority className="h-8 w-8 object-contain brightness-0" />
          <span className="font-semibold tracking-tight">EduNexa <span className="ml-1 text-[10px] font-medium uppercase tracking-wider text-gray-400">Admin</span></span>
        </Link>
        <nav aria-label="Admin navigation" className="flex-1 space-y-0.5 px-3 py-6">
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Workspace</p>
          {sections.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => { setActiveSection(id); setSearch(""); }} aria-current={activeSection === id ? "page" : undefined} className={`flex w-full items-center gap-3 border-l-2 px-3 py-2.5 text-left text-[13px] font-medium transition ${activeSection === id ? "border-amber-600 bg-amber-50 text-amber-950" : "border-transparent text-gray-600 hover:bg-amber-50 hover:text-gray-900"}`}>
              <Icon size={16} strokeWidth={1.7} />{label}
            </button>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-4">
          <p className="truncate px-3 text-xs font-medium text-gray-700">{admin.name || admin.email}</p>
          <p className="px-3 pt-1 text-[11px] text-gray-400">Administrator</p>
          <Link href="/" className="mt-4 flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={15} />Return to site</Link>
        </div>
      </aside>

      <main className="mx-auto max-w-[1500px] px-5 py-7 sm:px-8 lg:ml-60 lg:px-10">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-gray-300 pb-5">
          <div>
            <p className="text-xs font-medium text-gray-500">Administration <span className="px-1 text-gray-300">/</span> {section.label}</p>
            <h1 className="mt-2 text-[26px] font-semibold tracking-tight sm:text-3xl">{activeSection === "overview" ? "Platform overview" : section.label}</h1>
            <p className="mt-1.5 text-sm text-gray-500">Review access and activity across EduNexa.</p>
          </div>
          <div className="border-l border-gray-300 pl-4 text-right text-sm text-gray-600"><span className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Signed in</span><span className="mt-1 block max-w-64 truncate font-medium text-gray-800">{admin.name || admin.email}</span></div>
        </header>

        <nav aria-label="Admin sections" className="mt-4 flex gap-1 overflow-x-auto border-b border-gray-300 pb-2 lg:hidden">
          {sections.map(({ id, label }) => <button key={id} type="button" onClick={() => { setActiveSection(id); setSearch(""); }} className={`shrink-0 border-b-2 px-3 py-2 text-xs font-semibold ${activeSection === id ? "border-gray-900 text-gray-950" : "border-transparent text-gray-500"}`}>{label}</button>)}
        </nav>

        {activeSection === "overview" ? (
          <>
            <section aria-label="Platform metrics" className="mt-7">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">
              {stats.map(({ id, label, value, description }) => (
                <button key={id} type="button" onClick={() => { setActiveSection(id); setSearch(""); }} className="group ui-panel flex min-h-32 flex-col justify-between p-4 text-left transition-colors hover:bg-amber-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2 sm:p-5">
                  <span className="text-[13px] font-medium leading-5 text-gray-600">{label}</span>
                  <span className="flex items-end justify-between gap-2"><span className="text-3xl font-semibold tabular-nums tracking-tight text-gray-950">{value}</span><span className="pb-1 text-[11px] text-gray-400 group-hover:text-gray-700">View list <ChevronRight size={13} className="ml-0.5 inline" /></span></span>
                </button>
              ))}
              </div>
            </section>

            <section className="mt-9 overflow-hidden rounded-lg border border-gray-300 bg-white">
              <div className="flex flex-wrap items-end justify-between gap-3 border-b border-gray-200 px-5 py-4 sm:px-6">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Verification</p><h2 className="mt-1 text-lg font-semibold">Teacher and parent requests</h2></div>
                <span className="text-xs font-medium text-gray-500">{requests.length} waiting</span>
                <button type="button" onClick={() => { setActiveSection("requests"); setSearch(""); }} className="text-xs font-semibold text-amber-800 hover:text-amber-900">Open review queue →</button>
              </div>
              <div className="px-5 sm:px-6"><RoleRequests requests={requests} /></div>
            </section>
          </>
        ) : activeSection === "requests" ? (
          <section className="mt-7 overflow-hidden rounded-lg border border-gray-300 bg-white">
            <div className="border-b border-gray-200 px-5 py-4 sm:px-6"><h2 className="font-semibold">Teacher and parent access requests</h2><p className="mt-1 text-sm text-gray-500">Approve a request to activate that role, or decline it to keep the account as a student.</p></div>
            <div className="px-5 sm:px-6"><RoleRequests requests={requests} /></div>
          </section>
        ) : (
          <section className="mt-7 overflow-hidden rounded-lg border border-gray-300 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 px-5 py-4 sm:px-6">
              <div><h2 className="font-semibold">{section.label}</h2><p className="mt-1 text-sm text-gray-500">{rows.length} {rows.length === 1 ? "record" : "records"}</p></div>
              <label className="relative block w-full sm:w-72"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><span className="sr-only">Search {section.label.toLowerCase()}</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this list" className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-gray-700" /></label>
            </div>
            {visibleRows.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="border-b border-gray-200 bg-[#fafaf9] text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500"><tr>{columns[activeSection].map((column) => <th key={column.title} className="px-5 py-3.5 sm:px-6">{column.title}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">{visibleRows.map((row) => <tr key={row.id || `${row.studentId}-${row.courseId}`} className="hover:bg-[#fafaf9]">{columns[activeSection].map((column) => <td key={column.title} className="px-5 py-4 align-top text-gray-600 sm:px-6">{column.render(row)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            ) : <div className="px-6 py-14 text-center"><p className="font-medium text-gray-700">{search ? "No matching records" : `No ${section.label.toLowerCase()} yet`}</p><p className="mt-1 text-sm text-gray-500">{search ? "Try a different search term." : "Records will appear here when they are added to EduNexa."}</p></div>}
          </section>
        )}
        <footer className="mt-8 border-t border-gray-300 py-5 text-xs text-gray-400">EduNexa administration · Account and learning data</footer>
      </main>
    </div>
  );
}
