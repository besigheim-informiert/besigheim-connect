import {
  ClerkLoaded,
  ClerkLoading,
  OrganizationList,
  OrganizationSwitcher,
  Show,
  SignIn,
  UserButton,
  useOrganization,
} from "@clerk/react";
import { Link, useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import { useMe } from "@/lib/admin-api";

/**
 * Frame for every `/admin` page: sign-in for guests, organisation choice for
 * members without an active club, and the admin navigation otherwise.
 *
 * Sign-up is intentionally absent: accounts are created by invitation only
 * (Clerk dashboard, sign-up mode "Restricted"). The backend additionally
 * refuses anyone without an organisation, so an uninvited account sees nothing.
 */
export default function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const clerkConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

  return (
    <Layout>
      <section className="container py-12 max-w-4xl">
        {!clerkConfigured && (
          <p className="text-muted-foreground">
            Die Anmeldung ist in dieser Umgebung nicht konfiguriert (VITE_CLERK_PUBLISHABLE_KEY fehlt).
          </p>
        )}
        {clerkConfigured && (
          <>
            <ClerkLoading>
              <p className="text-muted-foreground">Anmeldung wird geladen …</p>
            </ClerkLoading>
            <ClerkLoaded>
              <Show when="signed-out">
                <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-3">Vereinsverwaltung</h1>
                    <p className="text-muted-foreground max-w-prose">
                      Hier pflegen Vereine ihre Angaben und Veranstaltungen auf Unser Besigheim.
                      Der Zugang wird auf Einladung eingerichtet. Wenn Ihr Verein noch keinen
                      Zugang hat, melden Sie sich bitte über das{" "}
                      <Link to="/kontakt" className="text-primary underline-offset-4 hover:underline">
                        Kontaktformular
                      </Link>
                      .
                    </p>
                  </div>
                  {/* No sign-up link: accounts are invitation-only (enforced in the Clerk dashboard). */}
                  <SignIn routing="hash" appearance={{ elements: { footerAction: { display: "none" } } }} />
                </div>
              </Show>
              <Show when="signed-in">
                <SignedInShell title={title}>{children}</SignedInShell>
              </Show>
            </ClerkLoaded>
          </>
        )}
      </section>
    </Layout>
  );
}

function SignedInShell({ title, children }: { title: string; children: React.ReactNode }) {
  const { organization, isLoaded } = useOrganization();
  const location = useLocation();
  const me = useMe(Boolean(organization));

  if (!isLoaded) {
    return <p className="text-muted-foreground">Wird geladen …</p>;
  }

  if (!organization) {
    return (
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-3">Verein auswählen</h1>
          <p className="text-muted-foreground max-w-prose">
            Bitte wählen Sie den Verein, den Sie verwalten möchten. Fehlt Ihr Verein, wurde Ihr
            Konto noch keinem Verein zugeordnet.
          </p>
        </div>
        <OrganizationList hidePersonal afterSelectOrganizationUrl="/admin" />
      </div>
    );
  }

  // The platform organisation is not a club: it only gets the review queue.
  const vereinTabs = me.data?.istPlattformOrg
    ? []
    : [
        { label: "Vereinsdaten", path: "/admin/verein" },
        { label: "Veranstaltungen", path: "/admin/veranstaltungen" },
      ];
  const tabs = [
    { label: "Übersicht", path: "/admin" },
    ...vereinTabs,
    ...(me.data?.istPlattformAdmin ? [{ label: "Freigabe", path: "/admin/freigabe" }] : []),
  ];

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow text-primary mb-1">Vereinsverwaltung</p>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <OrganizationSwitcher hidePersonal afterSelectOrganizationUrl="/admin" />
          <UserButton />
        </div>
      </div>
      <nav aria-label="Verwaltung" className="flex flex-wrap gap-1 border-b border-foreground/10">
        {tabs.map((tab) => {
          const active =
            tab.path === "/admin" ? location.pathname === tab.path : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              aria-current={active ? "page" : undefined}
              className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {me.data && !me.data.kannBearbeiten && !me.data.istPlattformOrg && (
        <p className="rounded-md border border-foreground/10 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Sie sind Mitglied dieses Vereins, aber nicht Administrator. Sie können die Daten ansehen,
          aber nicht ändern.
        </p>
      )}
      <div>{children}</div>
    </div>
  );
}
