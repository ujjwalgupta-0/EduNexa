import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Impact() {
  return (
    <section id="community" className="scroll-mt-20 bg-white px-5 py-20 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 border-t border-neutral-200 pt-10 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">A shared community</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Good learning depends on good support.</h2>
          <p className="mt-4 max-w-xl leading-7 text-neutral-600">Students, teachers, and parents each bring something important. EduNexa helps keep the work and communication connected.</p>
        </div>
        <Link href="#role-selector" className="inline-flex w-fit items-center gap-2 border-b border-amber-500 pb-2 text-sm font-semibold hover:border-amber-700">
          Find your workspace <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
