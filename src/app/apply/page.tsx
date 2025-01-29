import banner from "@/assets/banner.png";
import Image from "next/image";

export default function ApplyPage() {
  return (
    <div className="p-2">
      <div className="flex justify-center content-center mt-5">
        <Image alt="test" src={banner} width={500} height={500}></Image>
      </div>
    </div>
  );
}
