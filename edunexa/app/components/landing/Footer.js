import Link from "next/link";
import BrandMark from "../BrandMark";

const columns = [
  { title: "Explore", links: [["Features", "#features"], ["How it works", "#how-it-works"], ["Community", "#community"]] },
  { title: "Workspaces", links: [["Student", "/login?role=student"], ["Teacher", "/login?role=teacher"], ["Parent", "/login?role=parent"]] },
  { title: "Your account", links: [["Sign in", "/login"], ["Create account", "/create-account"]] },
];

export default function Footer() {
  return (
    <footer id="contact" className="bg-neutral-950 text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" aria-label="EduNexa home" className="inline-flex items-center gap-2.5"><BrandMark size={34} variant="dark" /><span className="text-lg font-semibold tracking-tight">EduNexa</span></Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-400">A shared place for students, teachers, and families to stay connected to learning.</p>
          </div>
          {columns.map(({ title, links }) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-400">
                {links.map(([label, href]) => <li key={label}><Link href={href} className="transition hover:text-white">{label}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/10 pt-5 text-xs text-neutral-500">
          <p>&copy; {new Date().getFullYear()} EduNexa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
