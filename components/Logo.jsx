// myPod mark: the click wheel (ring + centre button) on an orange tile.
// Same drawing as app/icon.svg, so the favicon and the in-app mark match.
export default function Logo({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="myPod"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="32" height="32" rx="8" fill="#ff6a2b" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="#000" strokeWidth="4" />
      <circle cx="16" cy="16" r="3" fill="#000" />
    </svg>
  );
}
