import { ReadonlyURLSearchParams } from "next/navigation";

export function getCallbackURL(params: ReadonlyURLSearchParams | null) {
    return params?.get("callbackURL") || params?.get("callbackUrl") || "/pte/dashboard";
}
