import { Button } from "@/components/ui/button";
import banner from "@/assets/banner.png";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Image
        src={banner}
        alt="Scrapyard 橫幅"
        className="h-44 w-fit mb-6"
        width={600}
        height={286}
      />

      <h1 className="font-bold text-2xl md:text-3xl text-center mb-2">
        參加 Scrapyard 黑客松
      </h1>
      <h2 className="text-center mb-4">
        Scrapyard 是由 HackIt 團隊舉辦的 Hack Club 黑客松
      </h2>

      <Button variant="secondary" className="w-full" asChild>
        <Link href="/apply/steps/1">立即報名</Link>
      </Button>
    </div>
  );
}
