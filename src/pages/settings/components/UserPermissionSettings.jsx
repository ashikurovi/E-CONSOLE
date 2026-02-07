import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useGetSystemusersQuery } from "@/features/systemuser/systemuserApiSlice";

const UserPermissionSettings = () => {
  const { data: apiData, isLoading } = useGetSystemusersQuery();
  const rawList = apiData?.data ?? apiData ?? [];
  const users = Array.isArray(rawList)
    ? rawList.map((u) => ({
        id: String(u.id),
        name: u.name ?? "—",
        email: u.email ?? "—",
        date: u.createdAt
          ? new Date(u.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
          : "—",
        role: u.role ? u.role.replace(/_/g, " ") : "—",
      }))
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin h-10 w-10 border-2 border-nexus-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User Permission</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage who has access in your system (data from API)</p>
      </div>

      <div className="rounded-md border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100 dark:border-gray-800">
              <TableHead className="w-[50px] pl-6">
                <Checkbox className="rounded border-gray-300" />
              </TableHead>
              <TableHead className="w-[80px] text-gray-400 font-normal">No</TableHead>
              <TableHead className="text-gray-400 font-normal">
                 <div className="flex items-center gap-1 cursor-pointer">
                    Employee Name
                    <div className="flex flex-col">
                        <ChevronUp className="h-2 w-2 text-gray-400" />
                    </div>
                 </div>
              </TableHead>
              <TableHead className="text-gray-400 font-normal">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Email Address
                    <div className="flex flex-col">
                        <ChevronUp className="h-2 w-2 text-gray-400" />
                    </div>
                 </div>
              </TableHead>
              <TableHead className="text-gray-400 font-normal">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Created Date
                    <div className="flex flex-col">
                        <ChevronUp className="h-2 w-2 text-gray-400" />
                    </div>
                 </div>
              </TableHead>
              <TableHead className="text-gray-400 font-normal">
                  <div className="flex items-center gap-1 cursor-pointer">
                    Type Access
                    <div className="flex flex-col">
                        <ChevronUp className="h-2 w-2 text-gray-400" />
                    </div>
                 </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b border-gray-50">
                <TableCell className="pl-6">
                  <Checkbox className="rounded border-gray-300" />
                </TableCell>
                <TableCell className="font-medium text-gray-900">{user.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                      <AvatarFallback>{(user.name || "?").substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{user.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-gray-900 font-medium">{user.email}</TableCell>
                <TableCell className="text-gray-900 font-medium">{user.date}</TableCell>
                <TableCell>
                   <span className="text-gray-900 dark:text-gray-100 font-medium">{user.role}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4">
           <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200 text-gray-500 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 font-medium text-gray-600 hover:bg-gray-100">1</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 font-medium text-gray-600 hover:bg-gray-100">2</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 font-medium text-gray-600 hover:bg-gray-100">3</Button>
              <span className="text-gray-400 px-1">...</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 font-medium text-gray-600 hover:bg-gray-100">10</Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200 text-gray-500 hover:bg-gray-50">
                <ChevronRight className="h-4 w-4" />
              </Button>
           </div>
           <div className="flex items-center gap-6 text-sm text-gray-500">
             <span>Showing 1 to 9 of 50 entries</span>
             <div className="flex items-center gap-2">
               <span>Show</span>
               <div className="flex items-center gap-4 border border-gray-200 rounded-md px-3 py-1 bg-white cursor-pointer hover:border-gray-300 transition-colors">
                 <span className="font-medium text-gray-900">8</span>
                 <ChevronUp className="h-3 w-3 text-gray-500" />
               </div>
               <span>entries</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionSettings;
