"use client";

import { grades, memberDataSchema, tShirtSizes } from "@/app/apply/types";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";

// FIXME: this page is currently broken due to lack of context (previous implementation was using a context provider)
export default function stepPage() {
  const router = useRouter();

  // TODO: integrate with zod
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [signature, setSignature] = useState<string | null>(null);

  const [show, setShow] = useState(true);
  const [back, setBack] = useState(false);

  const handleSignatureEnd = () => {
    if (sigRef.current) {
      setSignature(sigRef.current.toDataURL());
    }
  };
  const clearSignature = () => {
    if (sigRef.current) {
      sigRef.current.clear();
    }
    setSignature(null);
  };

  useEffect(() => {
    console.log(signature);
  }, [signature]);

  const form = useForm({
    resolver: zodResolver(memberDataSchema),
  });

  // TODO: need to const the type
  const onSubmit = () => {
    localStorage.setItem("signup-form-last-page", "2");
    setShow(false);
    router.push("/apply/steps/3/");
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
          className="mx-auto my-6 flex flex-col place-items-center overflow-y-auto [width:clamp(300px,450px,100vw)]"
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
                  name="NameEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文名字 *</FormLabel>
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
                  name={`NameZh`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>中文名字 *</FormLabel>
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
                      <FormLabel>常用電子郵件 *</FormLabel>
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
              </div>

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
                  name={`emergencyContactNationalID`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>緊急聯絡人身分證字號 (保險用) *</FormLabel>
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
                  name={`teamLeader.tShirtSize`}
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

              <div className="space-y-2">
                <p className="text-lg font-bold">
                  請詳閱xxxxxxxxxxx後在下方簽名
                </p>

                <p className="text-sm">
                  請本人在此簽名 (簽名及代表同意xxxxx) *
                </p>
                <div className="rounded-md bg-white">
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{ width: 450 }}
                    ref={sigRef}
                    onEnd={handleSignatureEnd}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-bold">
                  請監護人詳閱xxxxxxxxxxx後在下方簽名
                </p>
                <p className="text-sm">
                  請監護人在此簽名 (簽名及代表同意xxxx) *
                </p>
                <div className="rounded-md bg-white">
                  <SignatureCanvas
                    penColor="black"
                    canvasProps={{ width: 450 }}
                    ref={sigRef}
                    onEnd={handleSignatureEnd}
                  />
                </div>
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
