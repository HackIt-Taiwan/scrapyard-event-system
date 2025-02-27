"use client";

import stackPaper from "@/assets/pixel_stack_paper.png";
import stampSideView from "@/assets/pixel_stamp_sideview.png";
import Clipboard from "@/components/Clipboard";
import Stamp from "@/components/Stamp";
import { Undo2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [isApproving, setApproving] = useState(false);
  const [teamID, setTeamID] = useState("");
  const [teamData, setTeamData] = useState<Array<
    Record<string, string>
  > | null>(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [stampedStatus, setStampedStatus] = useState<
    "approve" | "rejected" | null
  >(null);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingText, setLoadingText] = useState("少女祈禱中...");

  const fetchNextTeam = async () => {
    try {
      setApproving(false);
      setStampedStatus(null);
      setTeamData(null);
      setLoadingData(true);

      const res = await fetch("/api/staff/approve/getteam");
      const data = await res.json();

      if (!data.message) {
        setLoadingText("已經沒有資料了 :/");
        return;
      }

      setTeamID(data.teamid);
      setTeamData(data.message); // Reset if data is invalid
      setLoadingData(false);
    } catch (error) {
      setLoadingData(false);
    }
  };

  const closeClipboard = async () => {
    setTeamData(null);
    setTeamID("");
    setShowClipboard(false);
    setStampedStatus(null);
    setLoadingText("少女祈禱中...");
  };

  useEffect(() => {
    if (showClipboard) {
      fetchNextTeam();
    }
  }, [showClipboard]);

  const markAsReviewed = async (
    status: "approve" | "rejected",
    reason: string = "placeholder",
  ) => {
    try {
      if (!teamData) return;
      setApproving(true);

      const reviewPayload = {
        _id: teamID,
        review: status,
        ...(status === "rejected" && reason ? { reason } : {}),
      };

      await fetch("/api/staff/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewPayload),
      });

      setStampedStatus(status);

      setTimeout(() => {
        fetchNextTeam();
      }, 2000);
    } catch (error) {
      setApproving(false);
    }
  };

  // Skip current team without approving or rejecting
  const skipTeam = () => {
    // Set loading state
    setApproving(true);
    
    // Fetch next team without any approval action
    setTimeout(() => {
      fetchNextTeam();
    }, 500);
  };

  return (
    <div className="mx-auto flex min-h-fit min-w-full grow flex-col items-center justify-center overflow-hidden bg-gray-900">
      {/* Overlay */}
      {showClipboard && (
        <>
          {/* Overlay with lower z-index than other component */}
          <div className="fixed inset-0 z-10 flex items-center justify-center overflow-hidden bg-black bg-opacity-80">
            <div className="flex items-center">
              {loadingData && (
                <div className="flex flex-row">
                  <span className="mr-4 font-fusion-pixel text-3xl text-white">
                    {loadingText}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            className="fixed left-8 top-8 z-40 text-red-500 transition-all hover:scale-110"
            onClick={() => closeClipboard()}
          >
            <Undo2 className="h-12 w-12" />
          </button>
        </>
      )}

      {/*Desk area*/}
      <div className="h-12 w-[30%] translate-y-60 bg-orange-900">
        <button
          className="group absolute -top-24 left-10 z-10 transition-all duration-200 ease-out hover:-top-[7rem]"
          onClick={() => setShowClipboard(true)}
        >
          <Image
            src={stackPaper}
            alt="stack of paper"
            className="max-h-[160px] max-w-[160px] group-hover:drop-shadow-[0px_10px_10px_rgba(115,194,251,0.8)]"
          />
        </button>
        <div className="absolute -top-6 left-80 z-10 hidden flex-row 2xl:flex">
          <Image
            src={stampSideView}
            alt="stamp side view"
            className="mr-6 max-h-[64px] max-w-[64px]"
          />
          <Image
            src={stampSideView}
            alt="stamp side view"
            className="max-h-[64px] max-w-[64px]"
          />
        </div>
      </div>
      <div className="h-6 w-[30%] translate-y-60 bg-orange-800" />
      {showClipboard && teamData && (
        <>
          <Clipboard data={teamData} stampedStatus={stampedStatus} />
          <div className="absolute right-36 flex w-1/2 flex-row justify-between px-36">
            <Stamp
              type="approve"
              onClick={() => markAsReviewed("approve")}
              disabled={isApproving}
            />
            <button
              className="rounded-lg bg-yellow-500 px-6 py-3 font-fusion-pixel text-lg text-black hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={skipTeam}
              disabled={isApproving}
            >
              Skip
            </button>
            <Stamp
              type="rejected"
              onClick={() => markAsReviewed("rejected")}
              disabled={isApproving}
            />
          </div>
        </>
      )}
    </div>
  );
}
