import Image from "next/image";
import favicon from "@/assets/favicon.png";
import NavThemeToggle from "@/components/navThemeToggle";

export default function () {
  return (
    <nav className="sticky z-10 top-0 left-0 w-full bg-gray-300 dark:bg-gray-700 ">
      <div className="mx-auto max-w-6xl px-4 py-2 flex place-items-center ">
        <Image
          src={favicon}
          alt="Scrapyard signup system favicon"
          width={38}
          height={38}
        />
        <h1 className="ml-4 font-semibold">Scrapyard 報名系統</h1>
        <div className="ml-auto">
          <NavThemeToggle />
        </div>
      </div>
    </nav>
  );
}
