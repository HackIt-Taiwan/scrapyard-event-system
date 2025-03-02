"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { memberDatabaseSchema } from "@/models/member";
import { teacherDatabaseSchema } from "@/models/teacher";
import { TeamDatabaseSchema } from "@/models/team";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { z } from "zod";

const TeamData = TeamDatabaseSchema.extend({
  member_list: memberDatabaseSchema.array(),
  teacher_data: teacherDatabaseSchema,
});

type TeamDataType = z.infer<typeof TeamData>;

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch member data");
    return res.json();
  });

export default function ReviewPage() {
  const [teamData, setTeamData] = useState<Array<TeamDataType> | null>(null);

  const router = useRouter();

  const {
    data: teamData_,
    error,
    isLoading,
  } = useSWR([`/api/staff/approve/get-all-team`], ([url]) => fetcher(url));

  useEffect(() => {
    if (teamData_) {
      // Get the original data
      const originalData = teamData_.data;
      
      // Check if we have enough teams to copy indices 3 and 4
      if (originalData && originalData.length >= 5) {
        // Create copies of teams at indices 3 and 4
        const teamCopy1 = JSON.parse(JSON.stringify(originalData[3]));
        const teamCopy2 = JSON.parse(JSON.stringify(originalData[4]));
        
        // Modify team names
        teamCopy1.team_name = `它叫我取團隊名稱`;
        teamCopy2.team_name = `別再用cursor了`;
        
        // Add the copies to the data
        const newData = [...originalData, teamCopy1, teamCopy2];
        setTeamData(newData);
      } else {
        // If not enough teams, just use the original data
        setTeamData(originalData);
      }

      console.log(teamData_.data);
    }
  }, [teamData_]);

  return (
    <div className="container mx-auto mt-10">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">新的團隊審核</h1>
      </div>
      <div>
        <Table>
          <TableCaption>新的團隊審核</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>隊伍編號</TableHead>
              <TableHead>隊伍ID</TableHead>
              <TableHead>隊伍名稱</TableHead>
              <TableHead>隊伍人數</TableHead>
              <TableHead>隊伍狀態</TableHead>
              <TableHead className="text-right">審核</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamData?.map(
              (team, index) =>
                ["資料確認中", "已拒絕", "已接受"].includes(team.status) && (
                  <TableRow key={team._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium">{team._id}</TableCell>
                    <TableCell className="font-medium">
                      {team.team_name}
                    </TableCell>
                    <TableCell>{team.team_size}</TableCell>
                    <TableCell>{team.status}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        onClick={() =>
                          router.push(`/staff/review?teamid=${team._id}`)
                        }
                      >
                        審核
                      </Button>
                    </TableCell>
                  </TableRow>
                ),
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
