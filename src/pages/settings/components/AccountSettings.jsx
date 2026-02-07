import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff } from "lucide-react";

const AccountSettings = ({ user: userFromApi }) => {
  const [showPassword, setShowPassword] = useState(false);
  const user = userFromApi ?? null;
  const displayName = user?.name ?? "";
  const email = user?.email ?? "";
  const phone = user?.phone ?? "";
  const avatarUrl = user?.companyLogo ?? user?.photo ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your account details from the server</p>
      </div>

      <div className="space-y-8">
        {/* My Profile - data from API */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">My Profile</h3>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
               {avatarUrl ? (
                 <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
               ) : (
                 <div className="h-full w-full flex items-center justify-center text-gray-500 text-xl font-medium">
                   {displayName ? displayName.charAt(0).toUpperCase() : "?"}
                 </div>
               )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={displayName} readOnly className="h-11 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} readOnly className="h-11 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={phone} readOnly className="h-11 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company</Label>
              <Input id="companyName" value={user?.companyName ?? ""} readOnly className="h-11 bg-gray-50 dark:bg-gray-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  defaultValue="********" 
                  className="h-11 pr-10" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 my-6"></div>

        {/* Delete Account */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Delete account</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-3xl">
            When you delete your account, you lose access to Front account services, and we permanently delete your personal data. You can cancel the deletion for 14 days.
          </p>
          <div className="flex gap-4 justify-end md:justify-start">
            <Button variant="destructive" className="bg-[#BE123C] hover:bg-[#9F1239] px-6">
              Delete Account
            </Button>
            <Button variant="outline" className="text-gray-700 border-gray-200 hover:bg-gray-50 px-6">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
