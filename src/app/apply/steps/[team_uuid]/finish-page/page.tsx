"use client";

// FIXME: still need to update to fix some issue
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { motion } from "motion/react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { twMerge } from "tailwind-merge";
import { TeamAffidavitSchema } from "@/models/team";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { teamAffidavitSchemaType } from "@/models/team";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
  const [loading, setLoading] = useState(false);
  const [uploadingTeamAffidavit, setUploadingTeamAffidavit] = useState(false);
  const [uploadingParentsAffidavit, setUploadingParentsAffidavit] = useState(false);

  const form = useForm<teamAffidavitSchemaType>({
    resolver: zodResolver(TeamAffidavitSchema),
    defaultValues: {
      team_affidavit: "",
      parents_affidavit: "",
    },
  });

  const {
    data: teamData,
    error,
    isLoading,
  } = useSWR([`/api/apply/team?auth=${authJwt}`], ([url]) => fetcher(url));

  // Set default values when team data is loaded
  useEffect(() => {
    if (teamData?.data) {
      form.reset({
        team_affidavit: teamData.data.team_affidavit || "",
        parents_affidavit: teamData.data.parents_affidavit || "",
      });
    }
  }, [teamData, form]);

  if (error) return notFound();

  // Check if all members are verified
  const allVerified = teamData?.data?.all_email_verified || false;

  const onSubmit = async (data: teamAffidavitSchemaType) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/apply/team/complete?auth=${authJwt}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      setLoading(false);
      if (!response.ok) {
        const errorMessage = await response.json();
        return toast({
          title: "送出表單時發生了一些問題",
          description: errorMessage.message,
        });
      }
      const bodyData = await response.json();
      console.log(bodyData);
      toast({
        title: "成功填寫完成!",
        description: "你的資料已經成功填寫完成，感謝你的參與！",
      });
      router.push("/");
    } catch (error) {
      console.error("Error submitting team data:", error);
      setLoading(false);
      toast({
        title: "發生錯誤",
        description: "送出表單時發生錯誤，請稍後再試",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {!isLoading && show ? (
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
                    <p className="text-lg">{teamData?.data?.team_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">團隊人數</label>
                    <p className="text-lg">{teamData?.data?.team_size} 人</p>
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
                    ? "已完成"
                    : "未完成"}
                </div>
                <button
                  className="flex-[2] rounded-lg border px-4 py-2"
                  onClick={() => {
                    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/apply/steps/${team_uuid}/member?auth=${teamData.data.leader_link}`;

                    if (
                      navigator.clipboard &&
                      typeof navigator.clipboard.writeText === "function"
                    ) {
                      navigator.clipboard
                        .writeText(link)
                        .then(() => alert("連結已複製！"))
                        .catch((err) => console.error("複製失敗", err));
                    } else {
                      const textarea = document.createElement("textarea");
                      textarea.value = link;
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand("copy");
                      document.body.removeChild(textarea);
                      alert("連結已複製！");
                    }
                  }}
                >
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
                    {teamData.data.verified_status[id] ? "已完成" : "未完成"}
                  </div>
                  <button
                    className="flex-[2] rounded-lg border px-4 py-2"
                    onClick={() => {
                      const link = `${process.env.NEXT_PUBLIC_BASE_URL}/apply/steps/${team_uuid}/member?auth=${teamData.data.members_link[index]}`;

                      if (
                        navigator.clipboard &&
                        typeof navigator.clipboard.writeText === "function"
                      ) {
                        navigator.clipboard
                          .writeText(link)
                          .then(() => alert("連結已複製！"))
                          .catch((err) => console.error("複製失敗", err));
                      } else {
                        const textarea = document.createElement("textarea");
                        textarea.value = link;
                        document.body.appendChild(textarea);
                        textarea.select();
                        document.execCommand("copy");
                        document.body.removeChild(textarea);
                        alert("連結已複製！");
                      }
                    }}
                  >
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
                    ? "已完成"
                    : "未完成"}
                </div>
                <button
                  className="flex-[2] rounded-lg border px-4 py-2"
                  onClick={() => {
                    const link = `${process.env.NEXT_PUBLIC_BASE_URL}/apply/steps/${team_uuid}/teacher?auth=${teamData.data.teacher_link}`;

                    if (
                      navigator.clipboard &&
                      typeof navigator.clipboard.writeText === "function"
                    ) {
                      navigator.clipboard
                        .writeText(link)
                        .then(() => alert("連結已複製！"))
                        .catch((err) => console.error("複製失敗", err));
                    } else {
                      const textarea = document.createElement("textarea");
                      textarea.value = link;
                      document.body.appendChild(textarea);
                      textarea.select();
                      document.execCommand("copy");
                      document.body.removeChild(textarea);
                      alert("連結已複製！");
                    }
                  }}
                >
                  複製連結
                </button>
              </div>
            </div>

            {/* Show verification status message */}
            {!allVerified && (
              <div className="my-4 rounded-lg bg-yellow-100 p-4 text-yellow-800">
                <h3 className="font-bold">尚未完成驗證</h3>
                <p>
                  請確保所有成員（包含指導老師）都已完成email驗證後，才能上傳切結書。
                  請檢查上方表格中的驗證狀態。
                </p>
              </div>
            )}

            {/* Show upload form only if all verified */}
            {allVerified && (
              <div className="flex flex-col gap-4 py-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="team_affidavit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">
                              請全隊簽署完成 <Affidavit /> 後上傳 *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setUploadingTeamAffidavit(true);
                                    const formData = new FormData();
                                    formData.append("pdf", file);

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
                                        field.onChange(data.data);
                                      }
                                    } catch (error) {
                                      console.error("Upload failed", error);
                                      toast({
                                        title: "上傳失敗",
                                        description: "請稍後再試",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setUploadingTeamAffidavit(false);
                                    }
                                  }}
                                  disabled={uploadingTeamAffidavit}
                                />
                                {uploadingTeamAffidavit && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <FormField
                        control={form.control}
                        name="parents_affidavit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold">
                              請全隊簽署完成 <ParentAffidavit /> 後上傳 *
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;

                                    setUploadingParentsAffidavit(true);
                                    const formData = new FormData();
                                    formData.append("pdf", file);

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
                                        field.onChange(data.data);
                                      }
                                    } catch (error) {
                                      console.error("Upload failed", error);
                                      toast({
                                        title: "上傳失敗",
                                        description: "請稍後再試",
                                        variant: "destructive",
                                      });
                                    } finally {
                                      setUploadingParentsAffidavit(false);
                                    }
                                  }}
                                  disabled={uploadingParentsAffidavit}
                                />
                                {uploadingParentsAffidavit && (
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                                  </div>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <Button type="submit" className="mt-4 w-full" disabled={loading}>
                        {loading ? (
                          <div role="status">
                            <svg
                              aria-hidden="true"
                              className="h-8 w-8 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                            <span className="sr-only">Loading...</span>
                          </div>
                        ) : (
                          "確認無誤！ 黑客松，啟動！"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            )}
          </div>
        </motion.div>
      ) : (
        <div className="flex h-screen items-center justify-center">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-b-8 border-t-8 border-gray-200"></div>
            <div className="absolute left-0 top-0 h-24 w-24 animate-spin rounded-full border-b-8 border-t-8 border-blue-500"></div>
          </div>
        </div>
      )}
    </>
  );
}

function Affidavit() {
  return (
    <a
      href="/2025%20Scrapyard%20Taiwan%20%E5%8F%83%E8%B3%BD%E5%88%87%E7%B5%90%E6%9B%B8.pdf"
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
