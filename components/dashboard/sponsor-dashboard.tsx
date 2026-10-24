"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateOwnSponsorProfile } from "@/lib/dashboard/actions";
import { Bell, Briefcase, Star, CalendarDays, Mail, Phone, MapPin, Building2, Globe, Users } from "lucide-react";

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
  profile: {
    id: string;
    userId: string;
    category: string | null;
    companyInfo: string | null;
    brandAssets: unknown;
    status: string;
    contactPersons: unknown;
    websiteLink: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null;
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

function formatJson(value: unknown) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function SponsorDashboard({ user, profile, announcements }: SponsorDashboardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [contactPersons, setContactPersons] = useState(formatJson(profile?.contactPersons));

  async function handleSubmit(formData: FormData) {
    formData.set("contactPersons", contactPersons);
    const result = await updateOwnSponsorProfile(formData);
    setMessage(result.error ?? "Profile saved successfully");
    setTimeout(() => setMessage(null), 3000);
  }

  const contacts = Array.isArray(profile?.contactPersons) ? profile.contactPersons : [];
  const assets = Array.isArray(profile?.brandAssets) ? profile.brandAssets : [];

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
              <Badge className={statusStyles[profile?.status ?? user.registrationStatus] ?? "bg-gray-100 text-gray-700"}>
                {profile?.status ?? user.registrationStatus}
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
              Manage your sponsor details. Some fields are managed by the secretariat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sp-category">Sponsor Category</Label>
                  <div className="relative">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input id="sp-category" name="category" defaultValue={profile?.category ?? user.category} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sp-website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input id="sp-website" name="websiteLink" type="url" defaultValue={profile?.websiteLink ?? ""} placeholder="https://example.com" className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sp-companyInfo">Company Information</Label>
                <Textarea id="sp-companyInfo" name="companyInfo" defaultValue={profile?.companyInfo ?? ""} rows={4} placeholder="Brief description of your company and sponsorship goals" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sp-contacts">
                  <Users size={16} className="inline-block mr-1" />
                  Contact Persons (JSON array)
                </Label>
                <Textarea
                  id="sp-contacts"
                  value={contactPersons}
                  onChange={(e) => setContactPersons(e.target.value)}
                  rows={4}
                  placeholder={`[\n  { "name": "John Doe", "email": "john@example.com", "phone": "+254...", "role": "Manager" }\n]`}
                />
              </div>

              {contacts.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Contact Persons</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {contacts.map((contact: Record<string, string>, i: number) => (
                      <div key={i} className="rounded-lg border bg-muted/30 p-3">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                        <p className="text-sm">{contact.email}</p>
                        <p className="text-sm">{contact.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assets.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Brand Assets</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {assets.map((asset: Record<string, string>, i: number) => (
                      <li key={i}>
                        <Link href={asset.url} target="_blank" className="text-primary hover:underline">
                          {asset.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit">Save Sponsor Profile</Button>
                {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users size={20} className="text-primary" />
                Primary Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-medium">{user.name}</p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} /> {user.email}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} /> {user.phone ?? "Not set"}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 size={14} /> {user.organization ?? "Not set"}
              </p>
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin size={14} /> {user.country ?? "Not set"}
              </p>
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
    </div>
  );
}
