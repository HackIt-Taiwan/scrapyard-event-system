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

  const [show, setShow] = useState(false);
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
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{
            type: "spring",
            scale: { type: "spring", visualDuration: 0.4, bounce: 0 },
          }}
          className="w-full"
        >
          <div className="no-scrollbar mx-auto flex h-[800px] max-w-[450px] flex-col place-items-center overflow-y-scroll px-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-8"
              >
                <label className="text-xl font-bold md:text-2xl">
                  隊長資料填寫
                </label>
                <p className="!mb-2 !mt-4 text-sm">* 為必填</p>
                <FormField
                  control={form.control}
                  name="teamLeader.name.en"
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
                  name={`teamLeader.name.zh`}
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
                  name={`teamLeader.grade`}
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
                  name={`teamLeader.school`}
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
                  name={`teamLeader.telephone`}
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
                  name={`teamLeader.email`}
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
                  name={`teamLeader.emergencyContact.name`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <b>緊急聯絡人</b>中文名字 *
                      </FormLabel>
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
                  name={`teamLeader.emergencyContact.telephone`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <b>緊急聯絡人</b>電話 *
                      </FormLabel>
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
                  name={`teamLeader.emergencyContact.ID`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <b>緊急聯絡人</b>身分證字號 *
                      </FormLabel>
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
                  name={`teamLeader.insurance.ID`}
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
                  name={`teamLeader.insurance.birthday`}
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
                  name={`teamLeader.specialNeeds`}
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
                  name={`teamLeader.diet`}
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

                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none">
                    請在此簽名 *
                  </p>
                  <div className="rounded-md bg-white">
                    <SignatureCanvas
                      penColor="black"
                      canvasProps={{ width: 418 }}
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
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
