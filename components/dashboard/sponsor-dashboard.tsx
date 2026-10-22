"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Briefcase, Star, CalendarDays, Mail, Phone, MapPin, Building2 } from "lucide-react";

export type SponsorDashboardProps = {
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

export function SponsorDashboard({ user, announcements }: SponsorDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <Star size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sponsorship</p>
              <Badge className={statusStyles[user.registrationStatus] ?? "bg-gray-100 text-gray-700"}>
                {user.registrationStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase size={20} className="text-amber-600" />
              Sponsor Profile
            </CardTitle>
            <CardDescription>
              Your sponsor information is managed by the secretariat. Contact us to update package details or brand assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Contact Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="flex items-center gap-2 font-medium">
                <Mail size={14} /> {user.email}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="flex items-center gap-2 font-medium">
                <Phone size={14} /> {user.phone ?? "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Organization</p>
              <p className="flex items-center gap-2 font-medium">
                <Building2 size={14} /> {user.organization ?? "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Country</p>
              <p className="flex items-center gap-2 font-medium">
                <MapPin size={14} /> {user.country ?? "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="font-medium">{user.category}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Bell size={20} className="text-primary" />
              Announcements
            </CardTitle>
            <CardDescription>Latest updates for sponsors.</CardDescription>
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
                    {item.category ? <p className="mt-1 text-xs text-muted-foreground">{item.category}</p> : null}
                    {item.excerpt ? <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p> : null}
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
