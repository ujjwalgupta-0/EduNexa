import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import BrandLink from "./BrandLink";

export default function WorkspacePageHeader({ href, backLabel }) {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <BrandLink size={32} />
      <Link href={href} className="inline-flex items-center gap-2 text-sm font-medium text-subtle transition hover:text-ink">
        <ArrowLeft size={15} />{backLabel}
      </Link>
    </header>
  );
}
