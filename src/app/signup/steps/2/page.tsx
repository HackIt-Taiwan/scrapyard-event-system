"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMultistepFormContext } from "@/app/signup/context";
import { type signUpData, signUpDataSchema } from "@/app/signup/types";
import { AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { grades } from "@/app/signup/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import SignatureCanvas from "react-signature-canvas";

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
    if (Number(localStorage.getItem("signup-form-last-page") ?? "1") < 1) {
      router.push(
        `/signup/steps/${(Number(localStorage.getItem("signup-form-last-page")) || 0) + 1}`,
      );
    } else {
      setShow(true);
    }

    console.log(signature);
  }, [signature, setShow]);

  const { formData, updateFormData } = useMultistepFormContext();
  const form = useForm({
    resolver: zodResolver(
      signUpDataSchema.pick({
        teamLeader: true,
      }),
    ),
    defaultValues: {
      teamLeader: formData.teamLeader,
    },
  });

  const onSubmit = (data: Partial<signUpData>) => {
    localStorage.setItem("signup-form-last-page", "2");
    updateFormData(data);
    // setShow(false);
    console.log(formData);
    // router.push("/signup/3/");
  };

  return (
    <AnimatePresence
      onExitComplete={() =>
        router.push(back ? "/signup/steps/1/" : "/signup/steps/3/")
      }
    >
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
                  隊長資料填寫
                </FormLabel>
                <FormField
                  control={form.control}
                  name="teamLeader.name.en"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>英文名字</FormLabel>
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
                      <FormLabel>中文名字</FormLabel>
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
                      <FormLabel>在學年級</FormLabel>
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
                      <FormLabel>在學學校</FormLabel>
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
                      <FormLabel>電話號碼</FormLabel>
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
                      <FormLabel>常用電子郵件</FormLabel>
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
                        <b>緊急聯絡人</b>中文名字
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
                        <b>緊急聯絡人</b>電話
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
                        <b>緊急聯絡人</b>身分證字號
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
                      <FormLabel>身分證字號 (保險用)</FormLabel>
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
                      <FormLabel>生日 (保險用)</FormLabel>
                      <br />
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal w-full",
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

                <div className="space-y-2">
                  <p className="text-sm font-medium leading-none">請在此簽名</p>
                  <div className="bg-white rounded-md">
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
              className="w-full mt-4"
              onClick={() => {
                setBack(true);
                setShow(false);
              }}
            >
              上一步 (此頁將不會儲存)
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
