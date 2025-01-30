import banner from "@/assets/banner.png";
import Image from "next/image";

export default function ApplyPage() {
  return (
    <div className="p-2">
      <div className="mt-5 flex content-center justify-center">
        <Image alt="test" src={banner} width={500} height={500}></Image>
      </div>
    </div>
  );
}
