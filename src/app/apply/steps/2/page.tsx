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
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import SignaturePad from "react-signature-canvas";

// FIXME: this page is currently broken due to lack of context (previous implementation was using a context provider)
export default function stepPage() {
  const router = useRouter();

  // TODO: integrate with zod
  const sigRef = useRef<SignaturePad | null>(null);
  const parentSignRef = useRef<SignaturePad | null>(null);

  const [show, setShow] = useState(true);
  const [back, setBack] = useState(false);

  const form = useForm({
    resolver: zodResolver(memberDataSchema),
  });

  const sing = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (sigRef.current) {
      form.setValue(
        "signature",
        sigRef.current.getTrimmedCanvas().toDataURL("image/png"),
      );
    }
  };

  const parentSing = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (parentSignRef.current) {
      form.setValue(
        "parentSignature",
        parentSignRef.current.getTrimmedCanvas().toDataURL("image/png"),
      );
    }
  };

  const singClear = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (sigRef.current) {
      sigRef.current.clear();
      form.setValue("signature", null);
    }
  };

  const parentSingClear = (e: React.FormEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (parentSignRef.current) {
      parentSignRef.current.clear();
      form.setValue("parentSignature", null);
    }
  };

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
                  請詳閱
                  <Affidavit />
                  後在下方簽名
                </p>

                <p className="text-sm">
                  請本人在此簽名 (簽名及代表同意
                  <Affidavit />) *
                </p>
                <div className="rounded-md bg-white">
                  <SignaturePad
                    canvasProps={{
                      className: "w-full aspect-[2/1]",
                    }}
                    penColor="black"
                    ref={sigRef}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button className="grow" onClick={(e) => sing}>
                    儲存
                  </Button>
                  <Button
                    className="grow"
                    onClick={(e) => singClear}
                    variant="destructive"
                  >
                    刪除
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-lg font-bold">
                  請監護人詳閱
                  <ParentAffidavit />
                  後在下方簽名
                </p>
                <p className="text-sm">
                  請監護人在此簽名 (簽名及代表同意
                  <ParentAffidavit />) *
                </p>
                <div className="rounded-md bg-white">
                  <SignaturePad
                    canvasProps={{
                      className: "w-full aspect-[2/1]",
                    }}
                    penColor="black"
                    ref={sigRef}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    className="grow"
                    onClick={(e) => parentSing}
                  >
                    儲存
                  </Button>
                  <Button
                    type="button"
                    className="grow"
                    onClick={(e) => parentSingClear}
                    variant="destructive"
                  >
                    刪除
                  </Button>
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
