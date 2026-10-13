import { cache } from "react";
import { getListed, getListing } from "./directory";

/** One database round trip per request, shared by generateMetadata and the page. */
export const loadListing = cache(getListing);

/** Real practices not on Mjeku.Im yet, for a specialty and/or city page. */
export const loadListed = cache(getListed);
