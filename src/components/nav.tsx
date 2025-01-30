import favicon from "@/assets/favicon.png";
import NavThemeToggle from "@/components/navThemeToggle";
import Image from "next/image";
import Link from "next/link";

export default function () {
  return (
    <nav className="sticky left-0 top-0 z-10 w-full bg-gray-300 dark:bg-gray-700">
      <div className="mx-auto flex max-w-6xl place-items-center px-4 py-2">
        <Image
          src={favicon}
          alt="Scrapyard signup system favicon"
          width={38}
          height={38}
        />
        <h1 className="ml-4 font-semibold">
          <Link href="/">Scrapyard 報名系統</Link>
        </h1>
        <div className="ml-auto">
          <NavThemeToggle />
        </div>
      </div>
    </nav>
  );
}
