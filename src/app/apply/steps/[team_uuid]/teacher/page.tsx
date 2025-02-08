"use client";

import { memberDataSchema, teacherData, tShirtSizes } from "@/app/apply/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/fetcher";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { notFound, useParams, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SignaturePad from "react-signature-canvas";
import useSWR from "swr";
import * as changeKeys from "change-case/keys";
import { toast } from "@/hooks/use-toast";

// FIXME: this page is currently broken due to lack of context (previous implementation was using a context provider)
export default function stepPage() {
  const searchParams = useSearchParams();
  const authJwt = searchParams.get("auth");
  const params = useParams();
  const { team_uuid } = params;
  const router = useRouter();

  if (!authJwt) {
    return notFound();
  }

  const [show, setShow] = useState(true);
  const [back, setBack] = useState(false);

  const {
    data: memberData_,
    error,
    isLoading,
  } = useSWR([`/api/apply/team/${team_uuid}/member?auth=${authJwt}`], ([url]) =>
    fetcher(url),
  );

  if (error) {
    return notFound();
  }

  const form = useForm<teacherData>({
    resolver: zodResolver(memberDataSchema),
    defaultValues: changeKeys.camelCase(memberData_, 5) || {},
  });

  const onSubmit = async (data: teacherData) => {
    try {
      const transformedData = changeKeys.snakeCase(data, 5);

      const response = await fetch(`/api/apply/team/${team_uuid}/member`, {
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

      setShow(false);
    } catch (error) {
      console.error("Error submitting team data:", error);
    }
    setShow(false);
  };

  return (
    <AnimatePresence
      onExitComplete={() =>
        router.push(back ? "/apply/steps/1/" : "/apply/steps/3/")
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
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <label className="text-xl font-bold md:text-2xl">
                指導老師資料填寫
              </label>
              <p className="!mb-2 !mt-4 text-sm">* 為必填</p>
              <div className="flex flex-col space-y-4 rounded-lg border-2 p-4">
                <h2 className="font-bold">個人資料</h2>
                <FormField
                  control={form.control}
                  name="nameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文姓名 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Xiao Ming Wang"
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
                  name={`nameZh`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文姓名 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="王小明"
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
                  name={`telephone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>聯絡電話 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0900000000"
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
                  name={`email`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電子郵件 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example@example.com"
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
                  name={`attend`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="items-top flex space-x-2">
                          <Checkbox
                            id="terms1"
                            required={true}
                            onCheckedChange={() => field.onChange(!field.value)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <label
                              htmlFor="terms1"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              是否出席此次黑客松?
                            </label>
                            <p className="text-sm text-muted-foreground">
                              如果有需要更改的話請在3/8號前Email我們!
                            </p>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* 保險相關資料 */}
              {/* <div className="flex flex-col space-y-4 rounded-lg border-2 p-4">
                <h2 className="font-bold">保險相關資料</h2>
                <FormField
                  control={form.control}
                  name={`nationalID`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>身分證字號 (保險用) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="A121212121"
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
                  name={`birthDate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>生日 (保險用) *</FormLabel>
                      <br />
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>請選擇日期</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="center">
                            <Calendar
                              mode="single"
                              selected={new Date(field.value)}
                              onSelect={field.onChange}
                              fromYear={2006}
                              toYear={2010}
                              defaultMonth={
                                field.value
                                  ? new Date(field.value)
                                  : new Date("2009-01-01")
                              }
                              captionLayout="dropdown"
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`nationalID`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>通訊地址 (保險用) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="臺北市信義區信義路5段7號"
                          required={true}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div> */}

              <div className="flex flex-col space-y-4 rounded-lg border-2 p-4">
                <h2 className="font-bold">其他資料</h2>
                <FormField
                  control={form.control}
                  name={`diet`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>食物相關需求(如素食等，如須出席才須填寫)</FormLabel>
                      <FormControl>
                        <Input placeholder="無" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name={`tShirtSize`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>T 恤尺寸 *</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="M" />
                          </SelectTrigger>
                          <SelectContent>
                            {tShirtSizes.map((k) => {
                              return (
                                <SelectItem value={k} key={k}>
                                  {k}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

              <Button type="submit" className="w-full">
                下一步
              </Button>
            </form>
          </Form>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => {
              setBack(true);
              setShow(false);
            }}
          >
            上一步 (此頁的更改將不會儲存)
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
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
