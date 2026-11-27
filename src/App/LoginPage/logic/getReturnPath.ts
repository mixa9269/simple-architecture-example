/** Where to go after login: the page that sent the user here (`state.from`), else home. */
export function getReturnPath(state: unknown): string {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('/login')
    ? from
    : '/';
}
