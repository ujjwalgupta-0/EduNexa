import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 rounded-2xl bg-[#e5a332] px-7 py-10 text-neutral-950 sm:flex-row sm:items-center sm:justify-between sm:px-10 sm:py-12">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-800/70">Your next step</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Make room for better learning.</h2>
          <p className="mt-3 text-sm leading-6 text-neutral-900/70">Choose your role and get started with EduNexa.</p>
        </div>
        <Link href="#role-selector" className="inline-flex w-fit items-center gap-3 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800">
          Get started <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
