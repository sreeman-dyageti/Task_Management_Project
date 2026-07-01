export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-cream animate-fade-in">
      {children}
    </div>
  );
}