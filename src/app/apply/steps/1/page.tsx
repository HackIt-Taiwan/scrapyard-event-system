"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type teamData, teamDataSchema } from "@/app/apply/types";
import { AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function StepPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  const form = useForm<teamData>({
    resolver: zodResolver(teamDataSchema),
    defaultValues: {
      name: "",
      teamSize: 4,
    },
  });

  // Prefetch next page
  useEffect(() => {
    router.prefetch("/signup/steps/2");
  }, [router]);

  const onSubmit = async (data: teamData) => {
    try {
      const response = await fetch("/api/apply/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Failed to submit team data: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("Team data submitted successfully:", result);

      setShow(false);
      setTimeout(() => {
        router.push("/signup/steps/2");
      }, 300);
    } catch (error) {
      console.error("Error submitting team data:", error);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-full"
        >
          <div className="h-[800px] max-w-[450px] px-4 overflow-y-auto mx-auto flex flex-col place-items-center">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
              >
                <label className="text-xl md:text-2xl font-bold">
                  團隊名稱與參賽人數
                </label>
                <p className="!mt-4 !mb-2 text-sm">* 為必填</p>

                {/* 團隊名稱 */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>團隊名稱 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="BanG Dream! It's MyGO!!!!!"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 團隊人數 */}
                <FormField
                  control={form.control}
                  name="teamSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>團隊人數 (不包含指導老師) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="一個團隊可有 4 ~ 5 個人"
                          type="number"
                          required
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 提交按鈕 */}
                <Button type="submit" className="w-full">
                  下一步
                </Button>
              </form>
            </Form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
