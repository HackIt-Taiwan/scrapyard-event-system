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
import { useMultistepFormContext } from "@/app/signup/context";
import { type signUpData, signUpDataSchema } from "@/app/signup/types";
import { AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function stepPage() {
  const router = useRouter();
  const [show, setShow] = useState(true);

  const { formData, updateFormData } = useMultistepFormContext();
  const form = useForm({
    resolver: zodResolver(
      signUpDataSchema.pick({ name: true, teamMemberCount: true }),
    ),
    defaultValues: { name: formData.name, teamMemberCount: 4 },
  });

  // Prefetch next page
  useEffect(() => {
    router.prefetch("/signup/steps/2");
  }, [router]);

  const onSubmit = (data: Partial<signUpData>) => {
    updateFormData(data);
    setShow(false);
  };

  return (
    <AnimatePresence onExitComplete={() => router.push("/signup/steps/2/")}>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{
            type: "spring",
            scale: { type: "spring", visualDuration: 0.4, bounce: 0 },
          }}
          className="w-full"
        >
          <div className="h-[800px] max-w-[450px] px-4 overflow-y-scroll no-scrollbar mx-auto flex flex-col place-items-center">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8 w-full"
              >
                <FormLabel className="text-xl md:text-2xl font-bold">
                  團隊名稱與參賽人數
                </FormLabel>
                <FormField
                  control={form.control}
                  name="name.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文團隊名稱</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="BanG Dream! It's MyGO!!!!!"
                          required={true}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name.zh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文團隊名稱</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="要跟我組一輩子的樂團嗎"
                          required={true}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="teamMemberCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>團隊人數 (不包含指導老師)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="一個團隊可有 4 ~ 5 個人"
                          type="number"
                          {...field}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
