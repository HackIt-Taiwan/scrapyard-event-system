"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { IDetectedBarcode, Scanner, useDevices } from '@yudiel/react-qr-scanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: string;
  label: string;
}

interface Member {
  _id: string;
  name_zh: string;
  checked_in: boolean;
  team_id: string;
  is_leader: boolean;
}

interface MemberInfo {
  name: string;
  id: string;
  team_name: string;
  team_id: string;
  student_id?: {
    card_front?: string;
    card_back?: string;
  };
}

interface Team {
  _id: string;
  team_name: string;
  members: Member[];
}

export default function CheckInPage() {
  const [checkInStatus, setCheckInStatus] = useState<"idle" | "success" | "error">("idle");
  const [memberInfo, setMemberInfo] = useState<{ 
    name: string; 
    id: string;
    team_name: string;
    team_id: string;
    student_id?: {
      card_front?: string;
      card_back?: string;
    };
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { toast } = useToast();
  
  // Camera selection state
  const devices = useDevices();
  const [selectedDevice, setSelectedDevice] = useState<MediaDeviceInfo | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  // Attendees state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch attendees data
  useEffect(() => {
    const fetchAttendees = async () => {
      setIsLoading(true);
      try {
        // Use the new API endpoint specifically for members
        const response = await fetch('/api/staff/checkin/get-members');
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Data is already formatted correctly by the API
          setTeams(data.data);
        } else {
          throw new Error(data.message || 'No data returned from API');
        }
      } catch (error) {
        console.error('Error fetching attendees:', error);
        toast({
          title: "Error",
          description: "Failed to load attendees data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAttendees();
  }, [refreshTrigger, toast]);

  // Toggle between front and back camera
  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const handleDecode = async (result: IDetectedBarcode[]) => {
    if (!result || result.length === 0) return;
    
    try {
      // Expected QR code format: JSON string with member_id field
      const data = result[0].rawValue
      if (!data) {
        throw new Error("Invalid QR code format. Missing member_id.");
      }

      // Call the check-in API
      const response = await fetch("/api/staff/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          member_id: data,
          checked_in: true,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to check in member");
      }

      // Update UI with success
      setMemberInfo({
        name: responseData.data.member_name || "Unknown Member",
        id: data,
        team_name: responseData.data.team_name || "Unknown Team",
        team_id: responseData.data.team_id || "",
        student_id: responseData.data.student_id
      });
      setCheckInStatus("success");
      
      // Refresh the attendees list
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "Check-in successful",
        description: `${responseData.data.member_name || "Member"} from team "${responseData.data.team_name}" has been checked in.`,
      });

    } catch (error) {
      console.error("Check-in error:", error);
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
      setCheckInStatus("error");
      
      toast({
        title: "Check-in failed",
        description: error instanceof Error ? error.message : "Failed to check in member",
        variant: "destructive",
      });
    }
  };

  const handleError = (error: any) => {
    console.error("QR scanner error:", error);
    setErrorMessage("QR scanner error: " + (error.message || "Unknown error"));
    setCheckInStatus("error");
  };

  const resetStatus = () => {
    setCheckInStatus("idle");
    setMemberInfo(null);
    setErrorMessage("");
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">參賽者報到</h1>
      
      <Tabs defaultValue="scanner" className="w-full max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="scanner">QR 掃描</TabsTrigger>
          <TabsTrigger value="attendees">報到名單</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner" className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Scanner</CardTitle>
              <CardDescription>掃描參賽者的QR碼進行報到</CardDescription>
            </CardHeader>
            <CardContent>
              {checkInStatus === "idle" && (
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
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4 bg-slate-100">
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

              {checkInStatus === "success" && memberInfo && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertTitle className="text-green-800">報到成功!</AlertTitle>
                  <AlertDescription className="text-green-700">
                    <p className="font-medium">參賽者: {memberInfo.name}</p>
                    <p className="text-sm mt-1">隊伍: {memberInfo.team_name}</p>
                    <p className="text-xs mt-1 text-gray-500">ID: {memberInfo.id}</p>
                    {memberInfo.student_id && (
                      <div className="mt-3 space-y-2">
                        <p className="text-sm font-medium">學生證</p>
                        {memberInfo.student_id.card_front && (
                          <div>
                            <a 
                              href={memberInfo.student_id.card_front} 
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img 
                                src={memberInfo.student_id.card_front} 
                                alt="學生證正面" 
                                className="w-full max-w-full object-contain rounded-md border border-gray-200" 
                                style={{ maxHeight: "160px" }}
                              />
                              <p className="text-xs text-center text-blue-600 mt-1">點擊查看原圖</p>
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button 
                      className="mt-4 w-full" 
                      onClick={resetStatus}
                    >
                      繼續掃描
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {checkInStatus === "error" && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertTitle className="text-red-800">報到失敗</AlertTitle>
                  <AlertDescription className="text-red-700">
                    <p>{errorMessage}</p>
                    <Button 
                      className="mt-4 w-full" 
                      onClick={resetStatus}
                      variant="destructive"
                    >
                      重試
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendees" className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>參賽者報到名單</CardTitle>
                <CardDescription>已報到人數: {teams.reduce((count, team) => count + team.members.filter(m => m.checked_in).length, 0)} / {teams.reduce((count, team) => count + team.members.length, 0)}</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setRefreshTrigger(prev => prev + 1)}
                disabled={isLoading}
              >
                {isLoading ? "載入中..." : "重新整理"}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <p>載入中...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {teams.map(team => {
                    const checkedInCount = team.members.filter(m => m.checked_in).length;
                    const totalMembers = team.members.length;
                    const isFullyCheckedIn = checkedInCount === totalMembers && totalMembers > 0;
                    
                    return (
                      <div 
                        key={team._id} 
                        className={`border rounded-lg p-4 ${
                          isFullyCheckedIn ? 'border-green-500 bg-green-50' : 
                          checkedInCount > 0 ? 'border-yellow-500' : 'border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-bold">
                            {team.team_name}
                          </h3>
                          <div className="text-sm">
                            <span className={`px-2 py-1 rounded-full ${
                              isFullyCheckedIn ? 'bg-green-100 text-green-800' : 
                              checkedInCount > 0 ? 'text-green-500' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {checkedInCount}/{totalMembers} 報到
                              {isFullyCheckedIn && ' ✓'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="pl-4 space-y-2 mt-4">
                          <table className="w-full">
                            <thead>
                              <tr className="text-xs text-gray-500 border-b">
                                <th className="text-left pb-2 font-normal">隊員</th>
                                <th className="text-center pb-2 font-normal">狀態</th>
                              </tr>
                            </thead>
                            <tbody>
                              {team.members.map(member => (
                                <tr key={member._id} className="border-b border-gray-100 last:border-0">
                                  <td className="py-2">
                                    <div className="flex items-center">
                                      <span>
                                        {member.name_zh} 
                                        {member.is_leader && <span className="ml-1 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full">隊長</span>}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="py-2 text-center">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                                      member.checked_in 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {member.checked_in ? '已報到' : '未報到'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                  
                  {teams.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                      沒有找到參賽隊伍資料
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 