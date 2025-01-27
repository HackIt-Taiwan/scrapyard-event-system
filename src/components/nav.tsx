import Image from "next/image";
import favicon from "@/assets/favicon.png";
import NavThemeToggle from "@/components/navThemeToggle";

export default function () {
  return (
    <nav className="sticky z-10 top-0 left-0 w-full bg-black/50">
      <div className="max-w-6xl px-4 py-2 grid grid-cols-2">
        <div className="justify-start items-center flex">
          <Image
            src={favicon}
            alt="Scrapyard signup system favicon"
            width={48}
            height={48}
          />
          <h1 className="ml-4 font-semibold">Scrapyard 報名系統</h1>
        </div>
        <div className="justify-end items-center flex">
          <NavThemeToggle />
        </div>
      </div>
    </nav>
  );
}
