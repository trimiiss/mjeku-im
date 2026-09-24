import Link from "next/link";
import { cookies } from "next/headers";
import { Logo } from "@/components/Logo";

export default async function NotFound() {
  const sq = (await cookies()).get("lang")?.value !== "en";
  return (
    <main className="not-found">
      <Link href="/" className="brand" aria-label="Mjeku.Im">
        <Logo />
      </Link>
      <h1>{sq ? "Kjo faqe nuk u gjet" : "Page not found"}</h1>
      <p className="muted">
        {sq
          ? "Profili që kërkon mund të jetë hequr ose adresa nuk është e saktë."
          : "The profile you are looking for may have been removed, or the address is not correct."}
      </p>
      <Link href="/" className="btn btn-primary">
        {sq ? "Kthehu te kërkimi" : "Back to search"}
      </Link>
    </main>
  );
}
