"use client";

// FIXME: still need to update to fix some issue
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

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

  // TODO: 根據auth給的jwt獲取team data返回到下方的部分，如果沒有全線的話可以返回404 or something
  const {
    data: teamData,
    error,
    isLoading,
  } = useSWR([`/api/apply/team/${team_uuid}?auth=${authJwt}`], ([url]) =>
    fetcher(url),
  );
  if (error) return notFound();

  console.log(teamData);

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
          <div className="no-scrollbar mx-auto h-[800px] max-w-[450px] overflow-y-scroll px-4">
            <h2 className="text-xl font-bold md:text-2xl">
              請將填寫連結傳送給你的組員!
            </h2>

            <div className="my-4 space-y-6">
              <section className="space-y-4">
                <h3 className="text-md font-semibold">團隊資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">
                      團隊中文名稱
                    </label>
                    <p className="text-lg">test</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      團隊英文名稱
                    </label>
                    <p className="text-lg">test</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">團隊人數</label>
                    <p className="text-lg">test 人</p>
                  </div>
                </div>
              </section>
            </div>

{/* TODO: show all member and teacher fill status and have a button or something like to upload pdf file after that it need to send back to the backend */}
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
