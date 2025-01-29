"use client";

// FIXME: still need to update to fix some issue
import { useRouter } from "next/navigation";
import { useMultistepFormContext } from "@/app/apply/context";
import { type signUpData } from "@/app/apply/types";
import { AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "motion/react";
import { format } from "date-fns";

export default function stepPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  const { formData, updateFormData } = useMultistepFormContext();

  return (
    <AnimatePresence onExitComplete={() => router.push("/signup/steps/2/")}>
      {show && (
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
          <div className="h-[800px] max-w-[450px] px-4 overflow-y-scroll no-scrollbar mx-auto">
            <h2 className="text-xl md:text-2xl font-bold">
              來看看這些資料對不對吧！
            </h2>

            <div className="space-y-6 my-4">
              <section className="space-y-4">
                <h3 className="text-md font-semibold">團隊資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">
                      團隊中文名稱
                    </label>
                    <p className="text-lg">{formData.name.zh}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">
                      團隊英文名稱
                    </label>
                    <p className="text-lg">{formData.name.en}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">團隊人數</label>
                    <p className="text-lg">{formData.teamMemberCount} 人</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-md font-semibold">隊長資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">中文名字</label>
                    <p className="text-lg">{formData.teamLeader.name.zh}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">英文名字</label>
                    <p className="text-lg">{formData.teamLeader.name.en}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">年級</label>
                    <p className="text-lg">{formData.teamLeader.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">學校</label>
                    <p className="text-lg">{formData.teamLeader.school}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">電話號碼</label>
                    <p className="text-lg">{formData.teamLeader.telephone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">電子郵件</label>
                    <p className="text-lg">{formData.teamLeader.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">T恤尺寸</label>
                    <p className="text-lg">{formData.teamLeader.tShirtSize}</p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-md font-semibold">緊急聯絡人資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">姓名</label>
                    <p className="text-lg">
                      {formData.teamLeader.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">電話</label>
                    <p className="text-lg">
                      {formData.teamLeader.emergencyContact.telephone}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-md font-semibold">保險資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">身分證字號</label>
                    <p className="text-lg">
                      {formData.teamLeader.insurance.ID}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">生日</label>
                    <p className="text-lg">
                      {format(
                        new Date(formData.teamLeader.insurance.birthday),
                        "yyyy/MM/dd",
                      )}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-md font-semibold">其他資料</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">特殊需求</label>
                    <p className="text-lg">
                      {formData.teamLeader.specialNeeds || "無"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">飲食需求</label>
                    <p className="text-lg">
                      {formData.teamLeader.diet || "無"}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div>
              <Button
                className="w-full mt-4"
                onClick={() => {
                  console.log(formData);
                }}
              >
                確認無誤！ 黑客松，啟動！
              </Button>
              <Button
                variant="secondary"
                className="w-full mt-4"
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
