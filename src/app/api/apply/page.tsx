import banner from "@/assets/banner.png";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

export default function ApplyPage() {
  return (
    <div className="p-2">
      <div className="mt-5 flex content-center justify-center">
        <Image alt="test" src={banner} width={500} height={500}></Image>

        <Card className="max-w-[50rem]">
          <CardHeader>
            <CardTitle>xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-5">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">團隊名稱</Label>
                <Input type="text" id="text" placeholder="請輸入團隊名稱" />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">團隊人數(不包括指導老師)</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="參賽者人數" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4人</SelectItem>
                    <SelectItem value="5">5人</SelectItem>
                  </SelectContent>
                </Select>{" "}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>下一步</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
