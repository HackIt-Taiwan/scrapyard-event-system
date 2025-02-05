"use client";

import { type teamData, teamDataSchema } from "@/app/apply/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as changeKeys from "change-case/keys";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function StepPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);
  const { toast } = useToast();

  const form = useForm<teamData>({
    resolver: zodResolver(teamDataSchema),
    defaultValues: {
      teamName: "",
      teamSize: 4,
    },
  });

  useEffect(() => {
    router.prefetch("/apply/steps/2");
  }, [router]);

  const onSubmit = async (data: teamData) => {
    try {
      const transformedData = changeKeys.snakeCase(data, 5);

      const response = await fetch("/api/apply/team", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        return toast({
          title: "送出表單時發生了一些問題",
          description: errorMessage.message,
        });
      }
      const bodyData = await response.json();
      console.log(bodyData)
      // If the response is successful, directly take the user to the next page
     // TODO: router.push到下一個step 2的部分（要加上auth=xxx (隊長的jwt)）
      setShow(false);
    } catch (error) {
      console.error("Error submitting team data:", error);
    }
  };

  return (
    <AnimatePresence
      // When the exit animation is complete, navigate to the next page.
      // We need to ensure only the exit animation will ONLY trigger if the form is submitted successfully
      onExitComplete={() => {
        router.push("/apply/steps/2");
      }}
    >
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mx-auto my-6 flex flex-col place-items-center overflow-y-auto [width:clamp(300px,450px,100vw)]"
        >
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-8"
            >
              <label className="text-xl font-bold md:text-2xl">
                團隊名稱與參賽人數
              </label>
              <p className="!mb-2 !mt-4 text-sm">* 為必填</p>

              {/* 團隊名稱 */}
              <FormField
                control={form.control}
                name="teamName"
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
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                下一步
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
