"use client";

import {
  grades,
  memberData,
  memberDataSchema,
  tShirtSizes,
} from "@/app/apply/types";
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
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import * as changeKeys from "change-case/keys";
import { AnimatePresence, motion } from "motion/react";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch member data");
    return res.json();
  });

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

  const form = useForm<memberData>({
    resolver: zodResolver(memberDataSchema),
    defaultValues: changeKeys.camelCase(memberData_, 5) || {},
  });

  const onSubmit = async (data: memberData) => {
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
        router.push(
          back
            ? `/apply/steps/create-team?auth=${authJwt}`
            : `/apply/steps/${team_uuid}/finish-page?auth=${authJwt}`,
        )
      }
    >
      {!isLoading && show && (
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
                隊長資料填寫
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
                  name={`grade`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>在學年級 *</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="高中一年級" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((k) => {
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
                />
                <FormField
                  control={form.control}
                  name={`school`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>在學學校 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="阿里山國中"
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
                      <FormLabel>電話號碼 *</FormLabel>
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
                  name="studentID.card_front"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>學生證 (正面) *</FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("image", file);

                            try {
                              const res = await fetch(
                                process.env.NEXT_PUBLIC_DATABASE_API +
                                  "/image/upload",
                                {
                                  method: "POST",
                                  body: formData,
                                },
                              );
                              const data = await res.json();

                              if (data.data) {
                                form.setValue(
                                  "studentID.card_front",
                                  data.data,
                                ); // Set the URL for card front
                              }
                            } catch (error) {
                              console.error("Upload failed", error);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.getValues("studentID.card_front") && (
                        <div>
                          <img
                            src={form.getValues("studentID.card_front")}
                            alt="Student Card Front"
                            style={{ width: "auto", height: "auto" }}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="studentID.card_back"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>學生證 (背面) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const formData = new FormData();
                            formData.append("image", file);

                            try {
                              const res = await fetch(
                                process.env.NEXT_PUBLIC_DATABASE_API +
                                  "/image/upload",
                                {
                                  method: "POST",
                                  body: formData,
                                },
                              );
                              const data = await res.json();

                              if (data.data) {
                                form.setValue("studentID.card_back", data.data); // Set the URL for card back
                              }
                            } catch (error) {
                              console.error("Upload failed", error);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {form.getValues("studentID.card_back") && (
                        <div>
                          <img
                            src={form.getValues("studentID.card_back")}
                            alt="Student Card Back"
                            style={{ width: "auto", height: "auto" }}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              {/* 保險相關資料 */}

              {/* 
              <div className="flex flex-col space-y-4 rounded-lg border-2 p-4">
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

              {/* 緊急聯絡人資料 */}
              <div className="flex flex-col space-y-4 rounded-lg border-2 p-4">
                <h2 className="font-bold">緊急聯絡人資料</h2>
                <FormField
                  control={form.control}
                  name={`emergencyContactName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>緊急聯絡人中文名字 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="王大銘"
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
                  name={`emergencyContactTelephone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>緊急聯絡人電話 *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0900121212"
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
                  name={`emergencyContactRelation`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>緊急聯絡人關係 *</FormLabel>
                      <FormControl>
                        <Input placeholder="父/母" required={true} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-col space-y-4 rounded-lg border-2 p-4">
                <h2 className="font-bold">其他資料</h2>
                <FormField
                  control={form.control}
                  name={`specialNeeds`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>特殊需求 (過敏、特殊疾病等)</FormLabel>
                      <FormControl>
                        <Input placeholder="無" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`diet`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>食物過敏物</FormLabel>
                      <FormControl>
                        <Input placeholder="無" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
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
                />
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
