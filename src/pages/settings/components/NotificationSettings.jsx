import React from "react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const NotificationSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Get notified what's happening right now, you can turn off at any time</p>
      </div>

      <div className="space-y-8">
        {/* Email Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Email Notifications</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Substance can send you email notifications for any new direct messages
            </p>
          </div>
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
               <Switch defaultChecked id="email-notif" className="data-[state=checked]:bg-nexus-primary" />
               <Label htmlFor="email-notif" className="text-base font-medium">On</Label>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Checkbox id="news" defaultChecked className="mt-1 data-[state=checked]:bg-nexus-primary data-[state=checked]:border-nexus-primary" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="news" className="text-base font-medium">News and Update Settings</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    The latest news about the latest features and software update settings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="tips" className="mt-1" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="tips" className="text-base font-medium">Tips and Tutorials</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tips and tricks in order to increase your performance efficiency
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox id="offer" defaultChecked className="mt-1 data-[state=checked]:bg-nexus-primary data-[state=checked]:border-nexus-primary" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="offer" className="text-base font-medium">Offer and Promotions</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Promotions about software package prices and about the latest discounts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800"></div>

        {/* More Activity */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">More Activity</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Substance can send you email notifications for any new direct messages
            </p>
          </div>
          <div className="md:col-span-8 space-y-6">
            <div className="flex items-center gap-2 mb-4">
               <Switch defaultChecked id="more-activity" className="data-[state=checked]:bg-nexus-primary" />
               <Label htmlFor="more-activity" className="text-base font-medium">On</Label>
            </div>

            <RadioGroup defaultValue="important" className="space-y-4">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="all" id="all" className="mt-1 text-nexus-primary border-nexus-primary" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="all" className="text-base font-medium">All Reminders & Activity</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Notify me all system activities and reminders that have been created
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="activity" id="activity" className="mt-1 text-nexus-primary border-nexus-primary" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="activity" className="text-base font-medium">Activity only</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Only notify me we have the latest activity updates about increasing or decreasing data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <RadioGroupItem value="important" id="important" className="mt-1 text-nexus-primary border-nexus-primary" />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="important" className="text-base font-medium">Important Reminder only</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Only notify me all the reminders that have been made
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
