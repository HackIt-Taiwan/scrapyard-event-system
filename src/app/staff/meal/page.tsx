"use client";

import { IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

// Shadcn UI components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define interfaces for our data
interface MealPickup {
  meal_type: string;
  meal_day: string;
  pickup_time: string;
  notes?: string;
}

interface MemberData {
  member_id: string;
  member_name: string;
  team_id: string;
  team_name: string;
  meal_pickups: MealPickup[];
  student_id?: {
    card_front: string;
    card_back: string;
  };
  is_leader: boolean;
}

interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}

const MealPage = () => {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [addingMeal, setAddingMeal] = useState(false);
  const [mealType, setMealType] = useState("晚餐"); // Default to dinner
  const [mealDay, setMealDay] = useState("Day 1"); // Default to Day 1
  const [notes, setNotes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const devices = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDecode = async (result: IDetectedBarcode[]) => {
    if (!result || result.length === 0) return;

    try {
      // Expected QR code format: JSON string with member_id field
      const memberId = result[0].rawValue;
      if (!memberId) {
        throw new Error("Invalid QR code format. Missing member_id.");
      }

      setLoading(true);

      const response = await fetch(
        `/api/staff/meal/get-history?memberId=${memberId}`,
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "無法獲取成員數據");
      }

      if (data.success) {
        // Add default values for student_id and is_leader if they're not in the API response
        const memberWithDefaults = {
          ...data.data,
          student_id: data.data.student_id || undefined,
          is_leader:
            typeof data.data.is_leader === "boolean"
              ? data.data.is_leader
              : false,
        };

        setMemberData(memberWithDefaults);
        setShowModal(true);
        toast.success(`已找到: ${data.data.member_name}`);

        if (!data.data.student_id) {
          console.warn("API response missing student_id field");
        }

        if (typeof data.data.is_leader !== "boolean") {
          console.warn("API response missing is_leader field");
        }
      } else {
        toast.error(data.message || "無法獲取成員數據");
      }
    } catch (error) {
      console.error("Error fetching member data:", error);
      toast.error("無法獲取成員數據");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async () => {
    if (!memberData) return;

    setAddingMeal(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/staff/meal/add-pickup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: memberData.member_id,
          meal_type: mealType,
          meal_day: mealDay,
          notes: notes || undefined,
        }),
      });

      const data = await response.json();

      // Specifically handle 409 Conflict
      if (response.status === 409) {
        setErrorMessage(`${memberData.member_name} 已經領取了 ${mealDay} 的 ${mealType}`);
        return;
      }

      if (!response.ok) {
        if (data.already_picked_up) {
          // Show more detailed message for already picked up meals
          setErrorMessage(`${memberData.member_name} 已經領取了 ${mealDay} 的 ${mealType}`);
        } else {
          setErrorMessage(data.message || "無法記錄餐食領取");
        }
        return;
      }

      if (data.success) {
        // Update the member data with the new meal pickup
        if (data.meal_pickup) {
          setMemberData({
            ...memberData,
            meal_pickups: [data.meal_pickup, ...memberData.meal_pickups],
          });
        }
        resetForm();
      }
    } catch (error) {
      console.error("Error adding meal pickup:", error);
      setErrorMessage("發生錯誤，無法記錄餐食領取");
    } finally {
      setAddingMeal(false);
    }
  };

  const resetForm = () => {
    setMemberData(null);
    setMealType("晚餐");
    setMealDay("Day 1");
    setNotes("");
    setShowModal(false);
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const handleError = (error: any) => {
    console.error("Scanner error:", error);
    toast.error("掃描錯誤，請重試");
  };

  return (
    <div className="container mx-auto py-10 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">餐食領取系統</h1>
        <p className="mt-1 text-muted-foreground">
          記錄和查看參賽者餐食領取情況
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>掃描成員QR碼以記錄餐點領取</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-lg">
            {!loading && (
              <>
                <div className="mb-4 flex justify-between items-center">
                  {devices && devices.length > 1 ? (
                    <Select
                      value={selectedDevice?.deviceId || ""}
                      onValueChange={(value: string) => {
                        const device = devices.find((d: MediaDeviceInfo) => d.deviceId === value);
                        if (device) setSelectedDevice(device);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="選擇相機" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device: MediaDeviceInfo) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `相機 ${device.deviceId.slice(0, 5)}...`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Button
                      onClick={toggleCamera}
                      variant="outline"
                      className="w-full"
                    >
                      {facingMode === "environment" ? "使用前置鏡頭" : "使用後置鏡頭"}
                    </Button>
                  )}
                </div>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
                  <Scanner
                    onScan={handleDecode}
                    onError={handleError}
                    scanDelay={1000}
                    constraints={{
                      facingMode: facingMode,
                      ...(selectedDevice ? { deviceId: { exact: selectedDevice.deviceId } } : {})
                    }}
                  />
                </div>
              </>
            )}
            <p className="mt-2 text-center text-xs text-muted-foreground">
              將QR碼對準相機進行掃描
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Member Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl  max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">成員資訊</DialogTitle>
          </DialogHeader>

          {memberData && (
            <div className="space-y-6">
              {/* User Information Card */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold">
                          {memberData.member_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          成員 ID: {memberData.member_id}
                        </p>
                      </div>
                      <Badge className="px-3 py-1 text-sm">
                        {memberData.team_name}
                      </Badge>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground">
                          身份
                        </p>
                        <p className="font-bold">
                          {memberData.is_leader ? "隊長" : "隊員"}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground">
                          學生證
                        </p>
                        <p className="font-bold">
                          {memberData.student_id ? "已提供" : "未提供"}
                        </p>
                      </div>
                    </div>

                    {/* Display student card images prominently */}
                    {memberData.student_id && (
                      <div className="w-full space-y-4">
                        <div>
                          <h3 className="mb-2 text-center text-lg font-semibold">
                            學生證照片
                          </h3>
                          <div className="rounded-lg bg-black/5 p-2">
                            <a
                              href={memberData.student_id.card_front}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={memberData.student_id.card_front}
                                alt="學生證正面"
                                className="mx-auto aspect-auto w-full rounded-md object-contain transition-opacity hover:opacity-90"
                                style={{ maxHeight: "300px" }}
                              />
                              <p className="mt-1 text-center text-xs text-blue-600">
                                點擊查看原圖
                              </p>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {!memberData.student_id && (
                      <div className="rounded-md border border-yellow-200 bg-yellow-50 p-4">
                        <p className="text-center font-medium text-yellow-800">
                          此成員未提供學生證照片
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Meal management tabs */}
              <Tabs id="meal-tabs" defaultValue="add" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="add">添加餐食記錄</TabsTrigger>
                  <TabsTrigger value="history">領取歷史</TabsTrigger>
                </TabsList>

                <TabsContent value="add" className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="meal-type">餐食類型</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇餐食類型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="早餐">早餐</SelectItem>
                          <SelectItem value="午餐">午餐</SelectItem>
                          <SelectItem value="晚餐">晚餐</SelectItem>
                          <SelectItem value="點心">點心</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meal-day">活動日</Label>
                      <Select value={mealDay} onValueChange={setMealDay}>
                        <SelectTrigger>
                          <SelectValue placeholder="選擇活動日" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Day 1">Day 1</SelectItem>
                          <SelectItem value="Day 2">Day 2</SelectItem>
                          <SelectItem value="Day 3">Day 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">備註 (選填)</Label>
                      <Input
                        id="notes"
                        placeholder="特殊要求或注意事項"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleAddMeal}
                    disabled={addingMeal}
                  >
                    {addingMeal ? "記錄中..." : "記錄餐食領取"}
                  </Button>
                  
                  {errorMessage && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="mr-2 inline-block h-4 w-4" />
                      {errorMessage}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="history" className="pt-4">
                  {memberData.meal_pickups &&
                  memberData.meal_pickups.length > 0 ? (
                    <Table className="border rounded-md overflow-hidden">
                      <TableHeader className="">
                        <TableRow>
                          <TableHead>餐食類型</TableHead>
                          <TableHead>活動日</TableHead>
                          <TableHead>領取時間</TableHead>
                          <TableHead>備註</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="">
                        {memberData.meal_pickups.map((pickup, index) => (
                          <TableRow key={index} className="border-b border-slate-200">
                            <TableCell>
                              <Badge variant="outline">
                                {pickup.meal_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{pickup.meal_day}</TableCell>
                            <TableCell>
                              {formatDate(pickup.pickup_time)}
                            </TableCell>
                            <TableCell>{pickup.notes || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      暫無領取記錄
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPage;
