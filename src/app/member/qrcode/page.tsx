"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import QRCode from "qrcode.react";

export default function MemberQRCodePage() {
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");
  const router = useRouter();
  const [memberData, setMemberData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      if (!memberId) {
        setError("會員 ID 未提供");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch member data to display name
        const response = await fetch(`/api/member/${memberId}`);
        
        if (!response.ok) {
          throw new Error("無法取得會員資料");
        }
        
        const data = await response.json();
        setMemberData(data.data);
      } catch (err) {
        console.error("Error fetching member data:", err);
        setError("載入會員資料時發生錯誤");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [memberId]);

  // QR code data
  const qrCodeData = JSON.stringify({
    member_id: memberId,
    timestamp: new Date().toISOString()
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium">載入中...</h2>
          <p className="text-gray-500">請稍候</p>
        </div>
      </div>
    );
  }

  if (error || !memberId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-red-600">發生錯誤</h2>
          <p className="text-gray-500">{error || "未提供會員 ID"}</p>
          <button
            className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-white"
            onClick={() => router.push("/")}
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-6">會員報到 QR 碼</h1>
        
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{memberData?.name_zh || "參賽者"}</CardTitle>
            <CardDescription>
              請在報到處向工作人員出示此 QR 碼進行報到
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <QRCode 
                value={qrCodeData} 
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="mt-4 text-sm text-gray-500">會員 ID: {memberId}</p>
            <p className="text-xs text-gray-400">此 QR 碼僅限一次性使用</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 