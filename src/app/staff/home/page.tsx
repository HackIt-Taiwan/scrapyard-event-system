"use client";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Users,
  FileCheck,
  Utensils,
} from "lucide-react";

// Shadcn UI components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function StaffHomePage() {
  const router = useRouter();

  const navigationItems = [
    {
      title: "團隊審核",
      description: "審核新的團隊申請",
      icon: <FileCheck className="h-8 w-8" />,
      href: "/staff/dashboard",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "參賽者報到",
      description: "管理參賽者的報到流程",
      icon: <ClipboardCheck className="h-8 w-8" />,
      href: "/staff/checkin",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "餐食管理",
      description: "記錄並管理餐食領取",
      icon: <Utensils className="h-8 w-8" />,
      href: "/staff/meal",
      color: "bg-amber-500 hover:bg-amber-600",
    },
    {
      title: "敬請期待",
      description: "敬請期待",
      icon: <Users className="h-8 w-8" />,
      href: "/staff/dashboard",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">黑客松工作人員管理系統</h1>
      <p className="text-center text-muted-foreground mb-10">
        選擇以下功能區域開始工作
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {navigationItems.map((item) => (
          <Card key={item.href} className="border-2 hover:border-primary/50 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${item.color} text-white`}>
                  {item.icon}
                </div>
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className={`w-full ${item.color} text-white`}
                onClick={() => router.push(item.href)}
              >
                開始管理
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 