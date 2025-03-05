import banner from "@/assets/banner.png";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex grow flex-col place-items-center justify-center">
      <Image
        src={banner}
        alt="Scrapyard 橫幅"
        className="mb-12 h-44 w-fit"
        width={600}
        height={286}
      />

      <h1 className="mb-2 text-center text-2xl font-bold md:text-3xl">
        參加 Scrapyard 黑客松
      </h1>
      <h2 className="mb-6 text-center">
        Scrapyard 是由 HackIt 團隊舉辦的 Hack Club 黑客松
      </h2>

      <Button variant="default" className="w-full" disabled>
        報名已截止
      </Button>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        報名期限已於 2024 年 3 月 5 日結束
      </p>
    </div>
  );
}
