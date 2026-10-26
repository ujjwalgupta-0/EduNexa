import Link from "next/link";
import BrandMark from "./BrandMark";

export default function BrandLink({ href = "/", variant = "light", size = 34, className = "" }) {
  return (
    <Link href={href} aria-label="EduNexa home" className={`inline-flex w-fit items-center gap-2.5 ${className}`}>
      <BrandMark size={size} variant={variant} />
      <span className="text-lg font-semibold tracking-tight">EduNexa</span>
    </Link>
  );
}
