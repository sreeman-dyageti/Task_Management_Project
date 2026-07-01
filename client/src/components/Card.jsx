export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-card border border-border-c rounded-2xl shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {children}
    </div>
  );
}

