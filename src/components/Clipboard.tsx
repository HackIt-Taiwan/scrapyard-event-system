import ClipboardImage from "@/assets/pixel_clipboard.png";
import { MoveLeft, MoveRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ClipboardProps {
  data: Array<Record<string, string>>;
}

export default function Clipboard({ data }: ClipboardProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const currentEntry = data[currentPage];

  return (
    <div className="fixed left-0 top-0 flex h-full w-1/2 flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-3xl">
        {/* Member Data Area */}
        <Image
          src={ClipboardImage}
          alt="Clipboard"
          width={300}
          height={400}
          className="w-full"
        />
        <div className="font-zen-kurenaido absolute left-1/4 top-28 w-1/2 whitespace-pre-line text-wrap text-2xl text-gray-800">
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
              <div className="absolute -top-[0px] left-96 hidden w-max max-w-xs text-wrap break-words rounded bg-blue-900 p-2 text-sm text-white shadow-md group-hover:inline-block">
                {value}
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
            <span className="font-zen-kurenaido text-center text-2xl text-gray-800">
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
