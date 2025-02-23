import Image from "next/image";
import ClipboardImage from "@/assets/pixel_clipboard.png"
import { useState } from "react";

interface ClipboardProps {
  data: string[][];
}

export default function Clipboard({ data }: ClipboardProps) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="fixed left-0 top-0 h-full w-1/4 p-4 flex flex-col items-center">
      <div className="relative w-full max-w-sm">
        <Image src={ClipboardImage} alt="Clipboard" width={300} height={400} className="w-full" />
        <div className="absolute top-12 left-10 right-10 text-black font-mono whitespace-pre-line">
          {data[currentPage].map((line, index) => (
            <p key={index} className="border-b border-gray-500 py-1">{line}</p>
          ))}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} className="p-2 bg-gray-200 rounded">Prev</button>
        <span>Page {currentPage + 1} / {data.length}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(data.length - 1, p + 1))} className="p-2 bg-gray-200 rounded">Next</button>
      </div>
    </div>
  );
}

