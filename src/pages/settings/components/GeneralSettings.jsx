import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const GeneralSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">General</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Update your business persona</p>
      </div>

      <div className="space-y-6">
        {/* Business Details */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Details</h3>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-nexus-primary/10 flex items-center justify-center text-nexus-primary font-medium text-xl">
              OH
            </div>
            <div className="flex gap-2">
              <Button className="bg-nexus-primary hover:bg-nexus-primary/90 text-white px-6">
                Upload new
              </Button>
              <Button variant="outline" className="text-gray-700 border-gray-200 hover:bg-gray-50 px-6">
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital/ Medical name</Label>
              <Input id="hospitalName" defaultValue="Rumah Sehat" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" defaultValue="rumahsehat@gmail.go.id" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" defaultValue="+123 4232 1312" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Select defaultValue="none">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select fax" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">---</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 my-6"></div>

        {/* Address */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select defaultValue="netherland">
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="netherland">Netherland</SelectItem>
                  <SelectItem value="usa">USA</SelectItem>
                  <SelectItem value="uk">UK</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" defaultValue="Waterford" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flat">Flat/Unit</Label>
              <Input id="flat" defaultValue="MI 48329" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input id="street" defaultValue="Wall Court Waterford" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Number</Label>
              <Input id="number" defaultValue="721" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" defaultValue="56789" className="h-11" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
