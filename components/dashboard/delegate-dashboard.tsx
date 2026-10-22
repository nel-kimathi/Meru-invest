"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateOwnProfile } from "@/lib/dashboard/actions";
import { CalendarDays, Mail, MapPin, Phone, Building2, User, Bell } from "lucide-react";

export type DelegateDashboardProps = {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    organization: string | null;
    country: string | null;
    category: string;
    role: string;
    registrationStatus: string;
    createdAt: Date;
    updatedAt: Date;
  };
  announcements: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    category: string | null;
    publishedAt: Date | null;
  }[];
};

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  APPROVED: "bg-green-100 text-green-700 hover:bg-green-100",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-100",
};

export function DelegateDashboard({ user, announcements }: DelegateDashboardProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await updateOwnProfile(formData);
    setMessage(result.error ?? "Profile saved successfully");
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="space-y-8">
      {/* Welcome + Status */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Registration</p>
              <Badge className={statusStyles[user.registrationStatus] ?? "bg-gray-100 text-gray-700"}>
                {user.registrationStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Building2 size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="font-medium">{user.organization ?? "Not set"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="font-medium">{user.country ?? "Not set"}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User size={20} className="text-primary" />
              My Profile
            </CardTitle>
            <CardDescription>
              Update your contact details. Your email, role and registration status are managed by the secretariat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input id="name" name="name" defaultValue={user.name} required className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input id="email" value={user.email} disabled className="pl-9 bg-muted/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input id="phone" name="phone" defaultValue={user.phone ?? ""} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input id="organization" name="organization" defaultValue={user.organization ?? ""} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input id="country" name="country" defaultValue={user.country ?? ""} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationStatus">Registration Status</Label>
                <Input id="registrationStatus" value={user.registrationStatus} disabled className="bg-muted/50" />
              </div>

              <div className="md:col-span-2 flex items-center gap-3">
                <Button type="submit">Save Profile</Button>
                {message ? (
                  <span className="text-sm text-muted-foreground">{message}</span>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell size={20} className="text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates from the secretariat.</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No announcements yet.</p>
            ) : (
              <div className="space-y-4">
                {announcements.map((item) => (
                  <div key={item.id} className="rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm">
                    <Link href={`/news/${item.slug}`} className="font-medium hover:text-primary hover:underline">
                      {item.title}
                    </Link>
                    {item.category ? (
                      <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                    ) : null}
                    {item.excerpt ? (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
