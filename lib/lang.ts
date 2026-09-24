import { cookies } from "next/headers";
import type { Lang } from "./types";

/** The visitor's language from the "lang" cookie (Albanian unless English was chosen). Server only. */
export async function currentLang(): Promise<Lang> {
  return (await cookies()).get("lang")?.value === "en" ? "en" : "sq";
}
