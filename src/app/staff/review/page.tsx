"use client";

import Clipboard from "@/components/Clipboard";
import Stamp from "@/components/Stamp";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ReviewPage() {
  const [isApproving, setApproving] = useState(false);
  const [teamData, setTeamData] = useState<Array<
    Record<string, string>
  > | null>(null);
  const [stampedStatus, setStampedStatus] = useState<
    "approve" | "rejected" | null
  >(null);
  const [animateStamp, setAnimateStamp] = useState(false);
  const [isLoadingData, setLoadingData] = useState(true);

  const searchParams = useSearchParams();
  const teamID = searchParams.get("teamid");
  const router = useRouter();

  const markAsReviewed = async (
    status: "approve" | "rejected",
    reason: string = "placeholder",
  ) => {
    try {
      if (!teamData) return;
      setAnimateStamp(true);
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
      console.log(reviewPayload);

      setStampedStatus(status);

      setTimeout(() => {
        router.push("/staff/dashboard");
      }, 2000);
    } catch (error) {
      setApproving(false);
    }
  };

  useEffect(() => {
    setLoadingData(true);
    if (!teamID) return;

    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/staff/approve/getteam?teamid=${teamID}`);
        if (!res.ok) throw new Error("Failed to fetch team data");
        const data = await res.json();
        setStampedStatus(
          data.status === "已接受"
            ? "approve"
            : data.status === "已拒絕"
              ? "rejected"
              : null,
        );
        setTeamData(data.message);
        setLoadingData(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTeam();
  }, [teamID]);

  return (
    <div className="mx-auto flex min-h-fit min-w-full grow flex-col items-center justify-center overflow-hidden bg-gray-900">
      <div className="flex flex-col items-center xl:flex-row">
        <Clipboard
          data={teamData ?? [{ 正在: "讀取中" }]}
          stampedStatus={stampedStatus}
          animateStamp={animateStamp}
        />
        <div className="absolute flex flex-row justify-between gap-2 px-10 max-xl:bottom-10 lg:px-36 xl:right-36 xl:w-1/2">
          <Stamp
            type="approve"
            onClick={() => markAsReviewed("approve")}
            disabled={isApproving || isLoadingData}
          />
          <Stamp
            type="rejected"
            onClick={() => markAsReviewed("rejected")}
            disabled={isApproving || isLoadingData}
          />
        </div>
      </div>
    </div>
  );
}
