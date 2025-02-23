"use client";

import ClipboardComponent from "@/components/Clipboard";
import stackPaper from "@/assets/pixel_stack_paper.png";
import stampSideView from "@/assets/pixel_stamp_sideview.png";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [teamData, setTeamData] = useState(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const fetchNextTeam = async () => {
    setLoadingData(true);
    const res = await fetch("/api/staff/approve/getteam");
    const data = await res.json();
    console.log(data.message);
    setTeamData(data.message);
    setLoadingData(false);
  };

  useEffect(() => {
    if (showClipboard) {
      fetchNextTeam();
    }
  }, [showClipboard]);

  const markAsReviewed = async () => {
    if (!teamData) return;

    //await fetch("/api/staff/approve", { method: "POST" });

    fetchNextTeam();
  };

  return (
    <div className="mx-auto flex min-h-fit min-w-full grow flex-col items-center justify-center overflow-hidden bg-gray-900">
      {/*Desk area*/}
      <div className="h-12 w-[30%] translate-y-60 bg-orange-900">
        <button
          className="group absolute -top-24 left-10 z-10 transition-all duration-200 ease-out hover:-top-[7rem]"
          onClick={() => setShowClipboard(true)}
        >
          <Image
            src={stackPaper}
            alt="stack of paper"
            className="h-40 w-40 group-hover:drop-shadow-[0px_10px_10px_rgba(115,194,251,0.8)]"
          />
        </button>
        <div className="absolute -top-6 left-80 z-10 flex flex-row">
          <Image
            src={stampSideView}
            alt="stamp side view"
            className="mr-6 h-16 w-16"
          />
          <Image
            src={stampSideView}
            alt="stamp side view"
            className="h-16 w-16"
          />
        </div>
      </div>
      <div className="h-6 w-[30%] translate-y-60 bg-orange-800" />
    </div>
  );
}
