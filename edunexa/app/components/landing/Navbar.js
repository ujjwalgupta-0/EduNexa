"use client";

import Link from "next/link";
import BrandMark from "../BrandMark";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const closeMenu = () => {
    setMobileMenu(false);
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-stone-200/80 bg-[#fbfaf7]/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" aria-label="EduNexa home">
          <BrandMark size={36} priority />

          <span className="text-2xl font-bold tracking-tight pop">
            EduNexa
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          <a href="#features" className="nav-link">
            Features
          </a>

          <a href="#how-it-works" className="nav-link">
            How It Works
          </a>

          <a href="#community" className="nav-link">Community</a>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold transition hover:border-slate-300 hover:bg-slate-50"
          >
            Log in
          </Link>

          <Link
            href="#role-selector"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-stone-950 transition hover:bg-amber-400"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="rounded-lg p-2 md:hidden"
          aria-label={mobileMenu ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenu}
        >
          {mobileMenu ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="border-t border-gray-100 bg-white px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">

            <a href="#features" onClick={closeMenu}>
              Features
            </a>

            <a href="#how-it-works" onClick={closeMenu}>
              How It Works
            </a>

            <a href="#community" onClick={closeMenu}>Community</a>

            <Link
              href="/login"
              className="rounded-xl border border-gray-200 px-5 py-3 text-center font-semibold"
              onClick={closeMenu}
            >
              Log in
            </Link>

            <Link
              href="#role-selector"
              className="rounded-full bg-amber-500 px-5 py-3 text-center font-semibold text-stone-950"
              onClick={closeMenu}
            >
              Get Started
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}
