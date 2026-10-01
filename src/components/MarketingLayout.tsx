import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";
import { isProtectedRoute, type ProtectedRoute } from "@/lib/protected-routes";
import { toast } from "sonner";

type FooterLink = readonly [string, ProtectedRoute];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/about" className="btn-ghost hidden sm:inline-flex">
            How it works
          </Link>
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/signup" className="btn-primary !h-10 !px-4 !text-sm">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Connect. Hire. Earn. A community job marketplace built for Belhar, Cape Town — helping
            neighbours find trusted help and local workers find steady income.
          </p>
        </div>
        <FooterCol
          title="For Community Members"
          links={
            [
              ["Post a job", "/member/post-job"],
              ["My jobs", "/member/jobs"],
              ["Member dashboard", "/member/dashboard"],
            ] satisfies FooterLink[]
          }
        />
        <FooterCol
          title="For Workers"
          links={
            [
              ["Find jobs", "/worker/find-jobs"],
              ["My applications", "/worker/applications"],
              ["Earnings", "/earnings"],
            ] satisfies FooterLink[]
          }
        />
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © 2026 Connectly · Belhar, Cape Town
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  const navigate = useNavigate();

  const openLink = async (event: React.MouseEvent<HTMLAnchorElement>, to: string) => {
    event.preventDefault();
    if (!isProtectedRoute(to)) {
      toast.error("This destination is not available.");
      return;
    }
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!data.user) {
        navigate({ to: "/login", search: { next: to } });
        return;
      }
      navigate({ to });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not verify your sign-in.");
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link
              to={to}
              onClick={(event) => void openLink(event, to)}
              className="hover:text-primary"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
