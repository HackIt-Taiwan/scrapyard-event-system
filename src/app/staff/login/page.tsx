"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function LoginPage() {
  const [step, setStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
    },
  });

  // Handle email
  const handleLoginSubmit = async (data: any) => {
    try {
      setLoading(true);
      const response = await fetch("/api/staff/auth/send-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        setLoading(false);
        return toast({
          title: "登入錯誤😵",
          description:
            errorMessage.errors?.[0]?.message || errorMessage.message,
        });
      }
      setStep(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      return toast({
        title: "登入錯誤😵，請稍後再試。",
      });
    }
  };

  // Verify OTP
  const verifyOtp = async () => {
    try {
      const email = form.getValues("email");

      setLoading(true);
      const response = await fetch("/api/staff/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, otp: otp }),
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        setLoading(false);
        return toast({
          title: "驗證錯誤😵",
          description:
            errorMessage.errors?.[0]?.message || errorMessage.message,
        });
      }

      router.push("/staff/dashboard");
    } catch (error) {
      console.log(error);
      setLoading(false);
      return toast({
        title: "驗證錯誤😵，請稍後再試。",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Input
  useEffect(() => {
    const hasEnteredAllDigits = otp.length === 6;
    if (hasEnteredAllDigits) {
      verifyOtp();
    }
  }, [otp]);

  // Resend
  const resend = () => {
    form.reset({ email: "" });
    setOtp("");
    setStep(false);
    setLoading(false);
  };

  // Actual UI
  return (
    <div className="max-w-screen absolute inset-0 mx-auto flex h-screen items-center justify-center">
      <div className="space-y-8 rounded-xl px-8 pb-8 pt-12 sm:shadow-xl">
        {!step ? (
          <h1 className="pb-0 text-center text-2xl font-semibold">登入🔐</h1>
        ) : (
          <h1 className="pb-0 text-center text-2xl font-semibold">
            請輸入驗證碼🔢
          </h1>
        )}
        {!step ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleLoginSubmit)}
              className="w-full space-y-6"
            >
              <div className="flex flex-row">
                <Input
                  placeholder="testing@staff.hackit.tw"
                  className="mr-4 pr-14"
                  required={true}
                  disabled={loading}
                  inputMode="email"
                  {...form.register("email", { required: true })}
                />
                <Button
                  type="submit"
                  variant="default"
                  size="icon"
                  className="pl-4 pr-4"
                  disabled={loading}
                >
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
                    <LogIn />
                  )}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={(value) => setOtp(value)}
            disabled={loading}
            inputMode="decimal"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        )}
        <div hidden={!step} className="flex justify-center">
          <a
            hidden={!step}
            href="#"
            onClick={resend}
            className="text-sm text-foreground"
          >
            沒有收到嗎？重新傳送看看👆
          </a>
        </div>
      </div>
    </div>
  );
}
