export default function AnimatedDots() {
  return (
    <span className="inline-flex items-baseline tracking-widest ml-0.5">
      <span className="animate-pulse duration-1000">.</span>
      <span className="animate-pulse duration-1000" style={{ animationDelay: '200ms' }}>.</span>
      <span className="animate-pulse duration-1000" style={{ animationDelay: '400ms' }}>.</span>
    </span>
  );
}
