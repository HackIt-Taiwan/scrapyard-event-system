"use client";

import { type teamData, teamDataSchema, learnAboutUsOptions } from "@/app/apply/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as changeKeys from "change-case/keys";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const teamSizes = [3, 4, 5];

export default function StepPage() {
  const router = useRouter();
  
  // Registration period has ended
  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto flex max-w-md flex-col gap-8 p-4"
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">報名已截止</h1>
          <p className="text-muted-foreground">
            Scrapyard 黑客松報名期限已於 2024 年 3 月 5 日結束。感謝您的關注！
          </p>
          <Button variant="default" className="mt-4" onClick={() => router.push('/')}>
            返回首頁
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
