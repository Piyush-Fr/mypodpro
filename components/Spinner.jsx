// The classic Mac OS X / iPod "throbber": 12 bars around a centre, fading in turn.
// Takes the text colour (currentColor), so it works on light and dark surfaces.
export default function Spinner({ size = 20, label = 'Loading', className = '' }) {
  return (
    <span
      className={`apple-spinner ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      {Array.from({ length: 12 }, (_, i) => (
        <i
          key={i}
          style={{ transform: `rotate(${i * 30}deg)`, animationDelay: `${(i - 12) / 12}s` }}
        />
      ))}
    </span>
  );
}
