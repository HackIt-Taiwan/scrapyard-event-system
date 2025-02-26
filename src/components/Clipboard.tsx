import StampApproveImage from "@/assets/pixel_approved.png";
import ClipboardImage from "@/assets/pixel_clipboard.png";
import StampRejectedImage from "@/assets/pixel_rejected.png";
import { MoveLeft, MoveRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ClipboardProps {
  data: Array<Record<string, string>>;
  stampedStatus: "approve" | "rejected" | null;
}

export default function Clipboard({ data, stampedStatus }: ClipboardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [stampScale, setStampScale] = useState(0.8);

  const baseTooltipClass =
    "absolute -top-[0px] left-96 hidden w-max max-w-xs text-wrap break-words rounded p-2 text-sm shadow-md group-hover:inline-block";

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
    <div className="fixed left-0 top-0 z-20 flex h-full w-1/2 flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-3xl">
        {/* Stamp Overlay */}
        {stampedStatus && (
          <div
            className="absolute left-56 top-[20%] transition-transform duration-300"
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
              className="h-80 w-80"
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
          className="pixelated-image w-full"
        />
        <div className="absolute left-1/4 top-28 w-1/2 whitespace-pre-line text-wrap font-fusion-pixel text-2xl text-gray-800">
          {Object.entries(currentEntry).map(([key, value]) => (
            <div
              key={key}
              className="group relative max-w-full border-b border-gray-500 py-0.5"
            >
              {/* Truncated Text */}
              <p className="inline-block max-w-full truncate">
                {key}: {value}
              </p>

              {/* Tooltip on Hover */}
              <div
                className={`${baseTooltipClass} ${copiedKey === key ? "bg-yellow-500 text-black" : "bg-blue-900 text-white"}`}
                onClick={() => handleCopyClick(value, key)}
              >
                {copiedKey === key ? "複製成功！" : value}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Controls Container */}
        <div className="absolute bottom-20 left-0 w-full">
          <div className="mx-auto flex w-full items-center justify-between px-48">
            <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}>
              <MoveLeft className="h-10 w-10 text-gray-800" />
            </button>
            <span className="text-center font-zen-kurenaido text-2xl text-gray-800">
              {currentPage + 1} / {data.length}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(data.length - 1, p + 1))
              }
            >
              <MoveRight className="h-10 w-10 text-gray-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
