"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function stepPage() {
  const router = useRouter();

  const [show, setShow] = useState(true);
  const [back, setBack] = useState(false);

  return (
    <AnimatePresence
      onExitComplete={() =>
        router.push(back ? "/apply/steps/2/" : "/apply/steps/4/")
      }
    >
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto my-6 flex flex-col place-items-center overflow-y-auto p-2 [width:clamp(300px,450px,100vw)]"
        >
          <div className="flex w-full flex-col justify-center space-y-2">
            <div className="flex space-x-2">
              <div className="w-3/6 rounded-lg border-2 p-2">隊長:</div>
              <button className="flex min-h-full w-2/6 place-items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/80">
                複製編輯連結
              </button>
              <div className="flex w-1/6 place-items-center justify-center rounded-lg bg-destructive p-2 text-black">
                未完成
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-3/6 rounded-lg border-2 p-2">組員:</div>
              <button className="flex min-h-full w-2/6 place-items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/80">
                複製編輯連結
              </button>
              <div className="flex w-1/6 place-items-center justify-center rounded-lg bg-destructive p-2 text-black">
                未完成
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-3/6 rounded-lg border-2 p-2">組員:</div>
              <button className="flex min-h-full w-2/6 place-items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/80">
                複製編輯連結
              </button>
              <div className="flex w-1/6 place-items-center justify-center rounded-lg bg-destructive p-2 text-black">
                未完成
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-3/6 rounded-lg border-2 p-2">組員:</div>
              <button className="flex min-h-full w-2/6 place-items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/80">
                複製編輯連結
              </button>
              <div className="flex w-1/6 place-items-center justify-center rounded-lg bg-destructive p-2 text-black">
                未完成
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="w-3/6 rounded-lg border-2 p-2">指導老師:</div>
              <button className="flex min-h-full w-2/6 place-items-center justify-center rounded-lg bg-primary text-black hover:bg-primary/80">
                複製編輯連結
              </button>
              <div className="flex w-1/6 place-items-center justify-center rounded-lg bg-chart-5 p-2 text-black">
                已完成
              </div>
            </div>
          </div>
          <Button type="submit" className="mt-4 w-full">
            下一步
          </Button>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => {
              setBack(true);
              setShow(false);
            }}
          >
            上一步
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
