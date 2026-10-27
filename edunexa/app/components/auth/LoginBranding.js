import Link from "next/link";
import BrandMark from "../BrandMark";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

export default function LoginBranding() {
  return (
    <section className="relative hidden overflow-hidden bg-[#e5a332] lg:flex">

      <div className="relative z-10 flex min-h-screen w-full flex-col px-12 py-8 xl:px-20 xl:py-10">

        {/* Logo */}
        <Link
          href="/"
          className="flex w-fit items-center gap-3"
        >
          <BrandMark size={40} variant="light" />

          <span className="text-xl font-bold tracking-tight text-neutral-950">
            EduNexa
          </span>
        </Link>

        {/* Main content */}
        <div className="mt-[clamp(3rem,10vh,7.5rem)] max-w-xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-neutral-950/15 bg-neutral-950/5 px-4 py-2 text-sm font-semibold text-neutral-950">
            <Brain size={16} className="text-neutral-950" />
            Intelligent learning ecosystem
          </div>

          <h1 className="text-5xl font-black leading-[1.08] tracking-tight text-neutral-950 xl:text-6xl">
            Welcome back.
            <br />

            <span className="text-white">
              Keep learning.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-neutral-950/75">
            Your learning journey doesn&apos;t stop here. Sign in to
            continue learning, teaching, tracking, and growing with
            EduNexa.
          </p>

          {/* Benefits */}
          <div className="mt-9 space-y-4">

            <div className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-neutral-950/70"
              />

              <span className="text-neutral-950/85">
                Personalized learning experience
              </span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-neutral-950/70"
              />

              <span className="text-neutral-950/85">
                Track progress and performance
              </span>
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                size={20}
                className="text-neutral-950/70"
              />

              <span className="text-neutral-950/85">
                Stay connected with your education
              </span>
            </div>

          </div>

        </div>

        {/* Bottom */}
        <div className="mt-auto flex items-center gap-3 pt-10 text-sm text-neutral-950/65">
          <GraduationCap size={18} />

          <span>
            Learn smarter. Grow faster.
          </span>

          <ArrowRight size={16} />
        </div>

      </div>
    </section>
  );
}
