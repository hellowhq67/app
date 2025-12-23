import type { ReadonlyURLSearchParams } from "next/navigation";

const allowedCallbackSet: ReadonlySet<string> = new Set([
	"/pte/dashboard",
	"/pte/profile",
    "/",
]);

export const getCallbackURL = (
	queryParams: ReadonlyURLSearchParams,
): string => {
	const callbackUrl = queryParams.get("callbackUrl");
	if (callbackUrl) {
		if (allowedCallbackSet.has(callbackUrl)) {
			return callbackUrl;
		}
		return "/pte/dashboard";
	}
	return "/pte/dashboard";
};
