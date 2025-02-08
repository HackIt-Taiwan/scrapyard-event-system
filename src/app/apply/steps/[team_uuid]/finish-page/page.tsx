"use client";

// FIXME: still need to update to fix some issue
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch team data");
    return res.json();
  });

export default function stepPage() {
  const searchParams = useSearchParams();
  const authJwt = searchParams.get("auth");
  const params = useParams();
  const { team_uuid } = params;

  const router = useRouter();
  const [show, setShow] = useState(true);

  const [affidavitLink, setAffidavitLink] = useState(null);

  // TODO: 根據auth給的jwt獲取team data返回到下方的部分，如果沒有全線的話可以返回404 or something
  const {
    data: teamData,
    error,
    isLoading,
  } = useSWR([`/api/apply/team?auth=${authJwt}`], ([url]) => fetcher(url));
  if (error) return notFound();

  return (
    <AnimatePresence onExitComplete={() => router.push("/apply/steps/2/")}>
      {!isLoading && show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{
            type: "spring",
            scale: { type: "spring", visualDuration: 0.4, bounce: 0 },
          }}
          className="w-full"
        >
          <div className="no-scrollbar mx-auto max-w-[450px] overflow-y-scroll px-4">
            <h2 className="text-xl font-bold md:text-2xl">
              請將填寫連結傳送給你的組員!
            </h2>

            <div className="my-4 space-y-6">
              <section className="space-y-4">
                <h3 className="text-md font-semibold">團隊資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">團隊名稱</label>
                    <p className="text-lg">{teamData.data.team_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">團隊人數</label>
                    <p className="text-lg">{teamData.data.team_size} 人</p>
                  </div>
                </div>
              </section>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="flex w-full items-center gap-4">
                <div className="flex-[2] rounded-lg px-4 py-2 text-left">
                  成員名稱
                </div>
                <div className="flex-[1] rounded-lg px-4 py-2 text-left">
                  填寫狀態
                </div>
                <div className="flex-[2] rounded-lg px-4 py-2 text-left">
                  複製連結
                </div>
              </div>
              <div className="flex w-full items-center gap-4">
                <div className="flex-[2] rounded-lg border px-4 py-2 text-center">
                  {teamData.data.member_name[teamData.data.leader_id]
                    ? teamData.data.member_name[teamData.data.leader_id]
                    : "隊長"}
                </div>
                <div
                  className={twMerge(
                    "bg- flex-[1] rounded-lg border px-4 py-2 text-center text-black",
                    teamData.data.verified_status[teamData.data.leader_id]
                      ? "bg-primary"
                      : "bg-destructive",
                  )}
                >
                  {teamData.data.verified_status[teamData.data.leader_id]
                    ? "未完成"
                    : "已完成"}
                </div>
                <button className="flex-[2] rounded-lg border px-4 py-2">
                  複製連結
                </button>
              </div>
              {teamData.data.members_id.map((id: any, index: any) => (
                <div key={index} className="flex w-full items-center gap-4">
                  <div className="flex-[2] rounded-lg border px-4 py-2 text-center">
                    {teamData.data.member_name[id]
                      ? teamData.data.member_name[id]
                      : "未知成員"}
                  </div>
                  <div
                    className={twMerge(
                      "bg- flex-[1] rounded-lg border px-4 py-2 text-center text-black",
                      teamData.data.verified_status[id]
                        ? "bg-primary"
                        : "bg-destructive",
                    )}
                  >
                    {teamData.data.verified_status[id] ? "未完成" : "已完成"}
                  </div>
                  <button className="flex-[2] rounded-lg border px-4 py-2">
                    複製連結
                  </button>
                </div>
              ))}

              <div className="flex w-full items-center gap-4">
                <div className="flex-[2] rounded-lg border px-4 py-2 text-center">
                  {teamData.data.member_name[teamData.data.teacher_id]
                    ? teamData.data.member_name[teamData.data.teacher_id]
                    : "指導老師"}
                </div>
                <div
                  className={twMerge(
                    "bg- flex-[1] rounded-lg border px-4 py-2 text-center text-black",
                    teamData.data.verified_status[teamData.data.teacher_id]
                      ? "bg-primary"
                      : "bg-destructive",
                  )}
                >
                  {teamData.data.verified_status[teamData.data.teacher_id]
                    ? "未完成"
                    : "已完成"}
                </div>
                <button className="flex-[2] rounded-lg border px-4 py-2">
                  複製連結
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 py-5">
              <div className="flex flex-col gap-4">
                <label className="font-bold">
                  請全隊簽署完成 <Affidavit /> 後上傳 *
                </label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("image", file);

                    try {
                      const res = await fetch(
                        process.env.NEXT_PUBLIC_DATABASE_API + "/pdf/upload",
                        {
                          method: "POST",
                          body: formData,
                        },
                      );
                      const data = await res.json();

                      if (data.data) {
                        setAffidavitLink(data.data);
                      }
                    } catch (error) {
                      console.error("Upload failed", error);
                    }
                  }}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="font-bold">
                  請全隊簽署完成 <ParentAffidavit /> 後上傳 *
                </label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const formData = new FormData();
                    formData.append("image", file);

                    try {
                      const res = await fetch(
                        process.env.NEXT_PUBLIC_DATABASE_API + "/pdf/upload",
                        {
                          method: "POST",
                          body: formData,
                        },
                      );
                      const data = await res.json();

                      if (data.data) {
                        setAffidavitLink(data.data);
                      }
                    } catch (error) {
                      console.error("Upload failed", error);
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Button className="mt-4 w-full">確認無誤！ 黑客松，啟動！</Button>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => {
                  setShow(false);
                }}
              >
                上一步
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TeamStatus() {
  const members = [
    { name: "隊友1號", status: "完成" },
    { name: "隊友2號", status: "還沒" },
    { name: "隊友3號", status: "還沒" },
    { name: "指導老師", status: "完成" },
  ];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full items-center gap-4">
        <div className="flex-[2] rounded-lg px-4 py-2 text-left">成員名稱</div>
        <div className="flex-[1] rounded-lg px-4 py-2 text-left">填寫狀態</div>
        <div className="flex-[2] rounded-lg px-4 py-2 text-left">複製連結</div>
      </div>
      {members.map((member, index) => (
        <div key={index} className="flex w-full items-center gap-4">
          <div className="flex-[2] rounded-lg border px-4 py-2 text-center">
            {member.name}
          </div>
          <div
            className={twMerge(
              "bg- flex-[1] rounded-lg border px-4 py-2 text-center text-black",
              member.status === "完成" ? "bg-primary" : "bg-destructive",
            )}
          >
            {member.status}
          </div>
          <button className="flex-[2] rounded-lg border px-4 py-2">
            複製連結
          </button>
        </div>
      ))}
    </div>
  );
}

function Affidavit() {
  return (
    <a
      href="/2025%20Scrapyard%20Taiwan%20%E5%8F%83%E8%B3%BD%E8%80%85%E5%88%87%E7%B5%90%E6%9B%B8.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      參賽者切結書
    </a>
  );
}

function ParentAffidavit() {
  return (
    <a
      href="/2025%20Scrapyard%20Taiwan%20%E6%B3%95%E5%AE%9A%E4%BB%A3%E7%90%86%E4%BA%BA%E5%8F%8A%E6%8C%87%E5%B0%8E%E8%80%81%E5%B8%AB%E7%AB%B6%E8%B3%BD%E5%8F%83%E8%88%87%E8%88%87%E8%B2%AC%E4%BB%BB%E5%88%87%E7%B5%90%E6%9B%B8.pdf"
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline"
    >
      法定代理人及指導老師競賽參與與責任切結書
    </a>
  );
}
