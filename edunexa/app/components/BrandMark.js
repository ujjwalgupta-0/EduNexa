import Image from "next/image";
import icon from "@/app/icon.png";

export default function BrandMark({ size = 40, className = "", priority = false, variant = "light" }) {
  return (
    <Image
      src={icon}
      width={size}
      height={size}
      alt=""
      priority={priority}
      className={`shrink-0 object-contain ${variant === "light" ? "brightness-0" : "brightness-0 invert"} ${className}`}
    />
  );
}
