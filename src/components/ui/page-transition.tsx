/**
 * A pass-through wrapper between the shell and the page content.
 *
 * The previous version applied a CSS keyframe fade that started the whole page
 * at `opacity: 0` on every navigation. That could leave content invisible if the
 * animation did not run, so the fade was removed: content is now painted
 * immediately. Route-level motion is not worth risking first paint.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
