/**
 * Navigate to a route if not already there.
 *
 * @param {string} pathname - The current path.
 * @param {Object} router - The router object from `useRouter`.
 * @param {string} targetRoute - The route to navigate to.
 */
export const navigateToRoute = (pathname, router, targetRoute) => {
  // Normalize paths by removing trailing slashes and ensuring consistency
  const currentPath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const normTargetRoute = targetRoute.startsWith('/') ? targetRoute : `/${targetRoute}`;
  
  // Only navigate if we're not already on the target route
  if (currentPath !== normTargetRoute && currentPath !== targetRoute) {
    router.push(targetRoute);
  }
};
