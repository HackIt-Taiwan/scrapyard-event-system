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
  const [show, setShow] = useState(true);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [teamData_, setTeamData] = useState<any>();

  const form = useForm<teamData>({
    resolver: zodResolver(teamDataSchema),
    defaultValues: {
      teamName: "",
      teamSize: 4,
      learnAboutUs: undefined,
    },
  });

  useEffect(() => {
    router.prefetch("/apply/steps/2");
  }, [router]);

  const onSubmit = async (data: teamData) => {
    setLoading(true);
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
        setLoading(false);
        return toast({
          title: "送出表單時發生了一些問題",
          description: errorMessage.message,
        });
      }
      const bodyData = await response.json();
      console.log(bodyData);

      setTeamData(bodyData);
      setShow(false);
    } catch (error) {
      console.error("Error submitting team data:", error);
      setLoading(false);
    }
  };

  return (
    <AnimatePresence
      // When the exit animation is complete, navigate to the next page.
      // We need to ensure only the exit animation will ONLY trigger if the form is submitted successfully
      onExitComplete={() => {
        router.push(`/apply/steps/${teamData_.data._id}/member?auth=${teamData_.data.leader_link}`);
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
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={field.value.toString()}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="請選擇團隊人數" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamSizes.map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size} 人
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="learnAboutUs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>你是如何得知這個活動的？ *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="請選擇" />
                      </SelectTrigger>
                      <SelectContent>
                        {learnAboutUsOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
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
                  "下一步"
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
