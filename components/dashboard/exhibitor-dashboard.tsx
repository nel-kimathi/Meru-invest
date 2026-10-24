"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateOwnExhibitorProfile } from "@/lib/dashboard/actions";
import { Bell, Store, MapPin, CalendarDays, Mail, Phone, Building2, Package, MapPinned } from "lucide-react";

export type ExhibitorDashboardProps = {
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
    companyProfile: string | null;
    industry: string | null;
    products: unknown;
    contactInfo: unknown;
    registrationStatus: string;
    boothId: string | null;
    createdAt: Date;
    updatedAt: Date;
    booth: {
      id: string;
      number: string;
      size: string | null;
      category: string | null;
      status: string;
      hall: { name: string };
    } | null;
  } | null;
  booth: {
    id: string;
    number: string;
    size: string | null;
    category: string | null;
    status: string;
    hall: { name: string };
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

const boothStatusStyles: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-700",
  RESERVED: "bg-blue-100 text-blue-700",
  ALLOCATED: "bg-purple-100 text-purple-700",
  OCCUPIED: "bg-gray-100 text-gray-700",
};

function formatJson(value: unknown) {
  if (!value) return "";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ExhibitorDashboard({ user, profile, booth, announcements }: ExhibitorDashboardProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [products, setProducts] = useState(formatJson(profile?.products));
  const [contactInfo, setContactInfo] = useState(formatJson(profile?.contactInfo));

  async function handleSubmit(formData: FormData) {
    formData.set("products", products);
    formData.set("contactInfo", contactInfo);
    const result = await updateOwnExhibitorProfile(formData);
    setMessage(result.error ?? "Profile saved successfully");
    setTimeout(() => setMessage(null), 3000);
  }

  const allocatedBooth = profile?.booth ?? booth;
  const productList = Array.isArray(profile?.products) ? profile.products : [];
  const contact = (profile?.contactInfo ?? {}) as Record<string, string>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
              <Store size={22} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exhibitor Status</p>
              <Badge className={statusStyles[profile?.registrationStatus ?? user.registrationStatus] ?? "bg-gray-100 text-gray-700"}>
                {profile?.registrationStatus ?? user.registrationStatus}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-700">
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
        <div className="space-y-8 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Store size={20} className="text-cyan-600" />
                Exhibitor Profile
              </CardTitle>
              <CardDescription>
                Manage your exhibitor details, products and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ex-industry">Industry</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                      <Input id="ex-industry" name="industry" defaultValue={profile?.industry ?? ""} placeholder="e.g. Agriculture, Technology" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ex-contactInfo">Contact Information (JSON)</Label>
                    <Textarea
                      id="ex-contactInfo"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      rows={3}
                      placeholder={`{ "phone": "+254...", "email": "info@example.com", "address": "..." }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ex-companyProfile">Company Profile</Label>
                  <Textarea id="ex-companyProfile" name="companyProfile" defaultValue={profile?.companyProfile ?? ""} rows={4} placeholder="Tell visitors about your company" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ex-products">
                    <Package size={16} className="inline-block mr-1" />
                    Products (JSON array)
                  </Label>
                  <Textarea
                    id="ex-products"
                    value={products}
                    onChange={(e) => setProducts(e.target.value)}
                    rows={4}
                    placeholder={`[\n  { "name": "Product A", "description": "..." }\n]`}
                  />
                </div>

                {productList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Products</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {productList.map((product: Record<string, string>, i: number) => (
                        <div key={i} className="rounded-lg border bg-muted/30 p-3">
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Button type="submit">Save Exhibitor Profile</Button>
                  {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
                </div>
              </form>
            </CardContent>
          </Card>

          {Object.keys(contact).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Mail size={20} className="text-primary" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.phone ? <p className="text-sm"><span className="font-medium">Phone:</span> {contact.phone}</p> : null}
                {contact.email ? <p className="text-sm"><span className="font-medium">Email:</span> {contact.email}</p> : null}
                {contact.address ? <p className="text-sm"><span className="font-medium">Address:</span> {contact.address}</p> : null}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <MapPinned size={20} className="text-primary" />
                Allocated Booth
              </CardTitle>
              <CardDescription>Your assigned exhibition space.</CardDescription>
            </CardHeader>
            <CardContent>
              {allocatedBooth ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Hall</span>
                    <span className="font-medium">{allocatedBooth.hall.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Booth Number</span>
                    <span className="font-medium">{allocatedBooth.number}</span>
                  </div>
                  {allocatedBooth.size ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Size</span>
                      <span className="font-medium">{allocatedBooth.size}</span>
                    </div>
                  ) : null}
                  {allocatedBooth.category ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="font-medium">{allocatedBooth.category}</span>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge className={boothStatusStyles[allocatedBooth.status] ?? "bg-gray-100 text-gray-700"}>
                      {allocatedBooth.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No booth allocated yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell size={20} className="text-primary" />
                Announcements
              </CardTitle>
              <CardDescription>Latest updates for exhibitors.</CardDescription>
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
