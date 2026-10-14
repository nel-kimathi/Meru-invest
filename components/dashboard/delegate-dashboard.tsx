"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOwnProfile } from "@/lib/dashboard/actions";

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

export function DelegateDashboard({ user, announcements }: DelegateDashboardProps) {
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await updateOwnProfile(formData);
    setMessage(result.error ?? "Profile saved successfully");
    setTimeout(() => setMessage(null), 3000);
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-heading text-2xl font-bold text-primary">My Profile</h2>
        <p className="text-sm text-muted-foreground">
          Update your contact details. Your email, role and registration status are managed by the secretariat.
        </p>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <form action={handleSubmit} className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={user.name} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={user.phone ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Input id="organization" name="organization" defaultValue={user.organization ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" defaultValue={user.country ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registrationStatus">Registration Status</Label>
                <Input id="registrationStatus" value={user.registrationStatus} disabled />
              </div>

              <div className="md:col-span-2">
                <Button type="submit">Save Profile</Button>
                {message ? (
                  <span className="ml-3 text-sm text-muted-foreground">{message}</span>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-heading text-2xl font-bold text-primary">Announcements</h2>
        {announcements.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {announcements.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    <Link href={`/news/${item.slug}`} className="hover:underline">
                      {item.title}
                    </Link>
                  </CardTitle>
                  {item.category ? (
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                  ) : null}
                </CardHeader>
                {item.excerpt ? (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{item.excerpt}</p>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
