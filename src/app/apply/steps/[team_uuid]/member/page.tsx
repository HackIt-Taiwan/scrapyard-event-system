"use client";

import {
  grades,
  memberData,
  memberDataSchema,
  tShirtSizes,
} from "@/app/apply/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import imageCompression from "browser-image-compression";
import * as changeKeys from "change-case/keys";
import { motion } from "motion/react";
import Image from "next/image";
import {
  notFound,
  useParams,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch member data");
    return res.json();
  });

// Add compression options
const compressionOptions = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

// Add helper function for image compression
async function compressImage(file: File) {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    return compressedFile;
  } catch (error) {
    console.error("Error compressing image:", error);
    throw error;
  }
}

export default function stepPage() {
  const searchParams = useSearchParams();
  const authJwt = searchParams.get("auth");
  const params = useParams();
  const { team_uuid } = params;
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingCardFront, setUploadingCardFront] = useState(false);
  const [uploadingCardBack, setUploadingCardBack] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showTShirtGuide, setShowTShirtGuide] = useState(false);
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

  const form = useForm<memberData>({
    resolver: zodResolver(memberDataSchema),
    defaultValues: {}, // 先給空物件作為預設值
  });

  // 當 memberData_ 載入完成後，更新 form 的值
  useEffect(() => {
    if (memberData_) {
      const transformedData = changeKeys.camelCase(
        memberData_.data,
        5,
      ) as memberData;
      form.reset(transformedData); // 使用 reset 方法更新整個表單的值
      console.log(form.getValues("studentId"));
    }
  }, [memberData_, form]);

  const onSubmit = async (data: memberData) => {
    setLoading(true);
    try {
      const transformedData = changeKeys.snakeCase(data, 5);

      const response = await fetch(
        `/api/apply/team/${team_uuid}/member?auth=${authJwt}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(transformedData),
        },
      );
      setLoading(false);
      if (!response.ok) {
        const errorMessage = await response.json();
        return toast({
          title: "送出表單時發生了一些問題",
          description: errorMessage.message,
        });
      }
      const bodyData = await response.json();
      console.log(bodyData);
      if (!bodyData.data.is_leader) {
        setShowSuccessDialog(true);
      } else {
        router.push(`/apply/steps/${team_uuid}/finish-page?auth=${authJwt}`);
        setShow(false);
      }
    } catch (error) {
      console.error("Error submitting team data:", error);
    }
  };

  return (
    <>
      <Dialog open={showTShirtGuide} onOpenChange={setShowTShirtGuide}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>T-shirt 尺寸指南</DialogTitle>
          </DialogHeader>
          <div className="relative w-full">
            <Image
              src={"/t-shirt.png"}
              alt="T-shirt Size Guide"
              width={800} // Adjust width and height accordingly
              height={600}
              className="w-full"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>成功填寫完成!</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>你的資料已經成功填寫完成，我們已經寄送驗證信到你的信箱。</p>
              <p>請記得檢查你的信箱並點擊驗證連結。</p>
              <p className="text-muted-foreground">
                你隨時可以回到這個頁面修改資料。
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)}>
              我知道了
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {!isLoading && show ? (
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
                參賽者資料填寫
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
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="請填寫在學年級" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={`grade-${grade}`} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
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
                      <FormLabel>在學學校(全名) *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="臺北市市立第一女子高級中學"
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
                  name="studentId.cardFront"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>學生證 (正面) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploadingCardFront(true);
                              try {
                                // Compress the image before uploading
                                const compressedFile =
                                  await compressImage(file);
                                const formData = new FormData();
                                formData.append("image", compressedFile);

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
                                    "studentId.cardFront",
                                    data.data,
                                  );
                                }
                              } catch (error) {
                                console.error("Upload failed", error);
                                toast({
                                  title: "上傳失敗",
                                  description: "請稍後再試",
                                  variant: "destructive",
                                });
                              } finally {
                                setUploadingCardFront(false);
                              }
                            }}
                            disabled={uploadingCardFront}
                          />
                          {uploadingCardFront && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                      {form.getValues("studentId.cardFront") && (
                        <div>
                          <img
                            src={form.getValues("studentId.cardFront")}
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
                  name="studentId.cardBack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>學生證 (背面) *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploadingCardBack(true);
                              try {
                                // Compress the image before uploading
                                const compressedFile =
                                  await compressImage(file);
                                const formData = new FormData();
                                formData.append("image", compressedFile);

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
                                    "studentId.cardBack",
                                    data.data,
                                  );
                                }
                              } catch (error) {
                                console.error("Upload failed", error);
                                toast({
                                  title: "上傳失敗",
                                  description: "請稍後再試",
                                  variant: "destructive",
                                });
                              } finally {
                                setUploadingCardBack(false);
                              }
                            }}
                            disabled={uploadingCardBack}
                          />
                          {uploadingCardBack && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                      {form.getValues("studentId.cardBack") && (
                        <div>
                          <img
                            src={form.getValues("studentId.cardBack")}
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
                      <FormLabel>飲食習慣 (素食、不吃豬肉等)</FormLabel>
                      <FormControl>
                        <Input placeholder="無" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shirtSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        T-shirt 尺寸 *
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-2 text-xs"
                          onClick={() => setShowTShirtGuide(true)}
                        >
                          查看尺寸表
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="請選擇 T-shirt 尺寸" />
                          </SelectTrigger>
                          <SelectContent>
                            {tShirtSizes.map((size) => (
                              <SelectItem key={`size-${size}`} value={size}>
                                {size}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                  "儲存資料"
                )}
              </Button>
            </form>
          </Form>
        </motion.div>
      ) : (
        <div className="flex gap-3">
          <div
            key="loading-container"
            className="flex h-screen items-center justify-center"
          >
            <div key="loading-spinner-outer" className="relative">
              <div
                key="loading-spinner-base"
                className="h-24 w-24 rounded-full border-b-8 border-t-8 border-gray-200"
              ></div>
              <div
                key="loading-spinner-animated"
                className="absolute left-0 top-0 h-24 w-24 animate-spin rounded-full border-b-8 border-t-8 border-blue-500"
              ></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
