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

  const {
    data: teamData_,
    error,
    isLoading,
  } = useSWR([`/api/staff/approve/get-all-team`], ([url]) => fetcher(url));

  useEffect(() => {
    if (teamData_) {
      setTeamData(teamData_.data);
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
            {teamData?.map((team, index) => 
              team.status === "資料確認中" && (
                <TableRow key={team._id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{team._id}</TableCell>
                  <TableCell className="font-medium">{team.team_name}</TableCell>
                  <TableCell>{team.team_size}</TableCell>
                  <TableCell>{team.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline">審核</Button>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
