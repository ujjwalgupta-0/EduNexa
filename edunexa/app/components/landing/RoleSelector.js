import Link from "next/link";
import {
  ArrowRight,
  GraduationCap,
  Users,
  ShieldCheck ,
} from "lucide-react";

const roles = [
  {
    title: "Student",
    description:
      "Find your courses, keep up with assignments, and see your learning progress.",
    icon: GraduationCap,
    color: "amber",
    href: "/login?role=student",
  },
  {
    title: "Teacher",
    description:
      "Organize courses and follow the progress of the learners you teach.",
    icon: Users,
    color: "stone",
    href: "/login?role=teacher",
  },
  {
    title: "Parent",
    description:
      "Connect to your child's learning and keep track of their school activity.",
    icon: ShieldCheck ,
    color: "amber",
    href: "/login?role=parent",
  },
];

export default function RoleSelector() {
  return (
    <section id="role-selector" className="scroll-mt-20 border-y border-stone-200 bg-[#fbfaf7] py-20 sm:py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Choose your workspace
          </p>

          <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Start with what brings you here.
          </h2>

          <p className="mt-4 text-gray-500">
            Sign in or create an account for the tools that fit your role.
          </p>

        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 md:grid-cols-3" >

          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <Link
                href={role.href}
                key={role.title}
                className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-7 text-left transition duration-200 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-lg hover:shadow-neutral-200/50 sm:p-8"
              >

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg transition ${
                    role.color === "amber"
                      ? "bg-amber-100 text-amber-900"
                      : "bg-stone-100 text-stone-700"
                  }`}
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight">
                  {role.title}
                </h3>

                <p className="mt-3 min-h-[3.5rem] leading-6 text-neutral-600">
                  {role.description}
                </p>

                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  Continue as {role.title}

                  <ArrowRight size={16} />
                </div>

              </Link>
            );
          })}

        </div>
      </div>
    </section>
  );
}
