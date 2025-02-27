import StampApproveImage from "@/assets/pixel_approved.png";
import ClipboardImage from "@/assets/pixel_clipboard.png";
import StampRejectedImage from "@/assets/pixel_rejected.png";
import { MoveLeft, MoveRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ClipboardProps {
  data: Array<Record<string, string>>;
  stampedStatus: "approve" | "rejected" | null;
  animateStamp: boolean;
}

export default function Clipboard({
  data,
  stampedStatus,
  animateStamp,
}: ClipboardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [stampScale, setStampScale] = useState(0.8);

  const currentEntry = data[currentPage];

  const handleCopyClick = (value: any, key: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopiedKey(key);

        setTimeout(() => {
          setCopiedKey(null);
        }, 500);
      })
      .catch((err) => {
        console.log("Error while copying text: ", err);
      });
  };

  useEffect(() => {
    if (stampedStatus) {
      setStampScale(0.7);

      const timeout = setTimeout(() => {
        setStampScale(1);
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [stampedStatus]);

  return (
    <div className="fixed top-16 z-20 flex h-full flex-col p-4 xl:left-0 xl:top-0 xl:w-1/2 xl:items-center xl:justify-center">
      <div className="relative w-full max-w-3xl">
        {/* Stamp Overlay */}
        {stampedStatus && (
          <div
            className={`absolute left-1/4 top-[20%] -translate-x-1/4 ${animateStamp ? "transition-transform duration-300" : ""} xl:left-56`}
            style={{
              transform: `scale(${stampScale}) rotate(-12deg)`,
              opacity: stampScale * 0.8, // This will animate opacity alongside scale
            }}
          >
            <Image
              src={
                stampedStatus === "approve"
                  ? StampApproveImage
                  : StampRejectedImage
              }
              alt={`${stampedStatus} stamp`}
              className="h-80 w-80 max-sm:max-h-[200px] max-sm:max-w-[200px]"
            />
          </div>
        )}
        {/* Member Data Area */}
        <Image
          priority={true}
          src={ClipboardImage}
          alt="Clipboard"
          width={300}
          height={400}
          className="pixelated-image w-[1000px] max-xl:max-h-[550px] xl:w-full"
        />
        <div className="absolute left-1/2 top-28 max-h-[400px] w-1/2 whitespace-pre-line text-wrap font-fusion-pixel text-2xl text-gray-800 max-xl:top-16 max-xl:-translate-x-1/2 max-xl:overflow-y-auto xl:left-1/4">
          {Object.entries(currentEntry).map(([key, value]) => (
            <div
              key={key}
              className="group relative max-w-full border-b border-gray-500 text-[clamp(10px,3vw,24px)] leading-tight xl:py-0.5 xl:text-[clamp(10px,1.5vw,24px)]"
            >
              {/* Truncated Text */}
              <p
                className="inline-block w-full truncate xl:max-w-full"
                onClick={() => handleCopyClick(value, key)}
              >
                {key}: {copiedKey === key ? "複製成功！" : value}
              </p>
            </div>
          ))}
        </div>

        {/* Navigation Controls Container */}
        <div className="absolute bottom-6 w-full xl:left-0 2xl:bottom-14">
          <div className="mx-auto flex w-full items-center justify-between px-28 sm:px-48">
            <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>
              <MoveLeft className="text-gray-800 sm:h-10 sm:w-10" />
            </button>
            <span className="text-center font-zen-kurenaido text-[clamp(14px,1vw,24px)] text-gray-800 sm:text-2xl">
              {currentPage + 1} / {data.length}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(data.length - 1, p + 1))
              }
            >
              <MoveRight className="text-gray-800 sm:h-10 sm:w-10" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
