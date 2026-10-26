import Link from "next/link";

export default function FooterColumn({ title, links }) {
  return (
    <div>

      <h3 className="font-bold">
        {title}
      </h3>

      <div className="mt-5 space-y-3 text-sm text-gray-400">

        {links.map((link) => (
          <Link
            href="#"
            key={link}
            className="block transition hover:text-white"
          >
            {link}
          </Link>
        ))}

      </div>

    </div>
  );
}