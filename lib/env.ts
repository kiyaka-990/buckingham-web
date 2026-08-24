/**
 * Environment questions, answered in one place.
 *
 * `NODE_ENV` is "production" for any production build, including a preview
 * deployment and a local `next start`. Vercel also sets `VERCEL_ENV`, which
 * distinguishes the real thing from a preview. Security decisions key off
 * "is this a developer's machine", so that is what {@link isProduction}
 * answers: anything that is not a development build is treated as production
 * and gets the strict path. Failing closed is the only safe default here.
 */
export const isProduction = () => process.env.NODE_ENV !== "development";

/** True only on the live production deployment, not on a preview. */
export const isLiveDeployment = () => process.env.VERCEL_ENV === "production";
