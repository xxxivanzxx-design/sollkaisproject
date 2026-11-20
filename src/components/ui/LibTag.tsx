/** Small mono annotation naming the motion library that owns this section. */
export function LibTag({ children }: { children: string }) {
  return <span className="libtag mono">{children}</span>;
}
