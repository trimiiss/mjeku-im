import { cache } from "react";
import { getListing } from "./directory";

/** One database round trip per request, shared by generateMetadata and the page. */
export const loadListing = cache(getListing);
