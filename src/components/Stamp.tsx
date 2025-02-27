import StampImage from "@/assets/pixel_stamp.png";
import Image from "next/image";

interface StampProps {
  type: "approve" | "rejected";
  onClick: () => void;
  disabled?: boolean;
}

export default function Stamp({ type, onClick, disabled }: StampProps) {
  return (
    <button
      onClick={onClick}
      className={`z-20 transition-all hover:scale-110 max-xl:w-1/3 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      disabled={disabled}
    >
      <Image
        src={StampImage}
        alt={`${type} stamp`}
        className="h-auto max-h-[512px] w-full max-w-[512px]"
      />
      <h1
        className={`font-zen-kurenaido text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl ${
          type === "approve"
            ? "text-green-400"
            : type === "rejected"
              ? "text-red-500"
              : ""
        }`}
      >
        {type}
      </h1>
    </button>
  );
}
