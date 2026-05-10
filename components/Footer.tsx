export default function Footer() {
  return (
    <footer className="py-8 px-6 text-center relative">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(124,58,237,0.25), rgba(6,182,212,0.2), transparent)' }}
      />
      <p className="text-slate-600 text-sm">
        © {new Date().getFullYear()} Fabjan Elezi. All rights reserved.
      </p>
    </footer>
  );
}
