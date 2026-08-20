import type { Metadata } from "next";

import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Admin Login | SuitFinders",
};

export default async function AdminLoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  const params = await searchParams;
  const hasError = params.error !== undefined;

  return (
    <section className="py-16 sm:py-20">
      <Container className="max-w-sm space-y-8">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl text-foreground">Admin Login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage suit requests.
          </p>
        </div>

        <form action={loginAdmin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {hasError ? (
            <p role="alert" className="text-sm text-destructive">
              Incorrect email or password.
            </p>
          ) : null}

          <Button type="submit" size="lg" className="h-12 w-full text-base">
            Sign in
          </Button>
        </form>
      </Container>
    </section>
  );
}
