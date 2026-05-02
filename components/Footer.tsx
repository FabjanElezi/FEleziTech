export default function Footer() {
  return (
    <footer
      className="py-8 px-6 text-center"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <p className="text-slate-600 text-sm">
        © {new Date().getFullYear()} Fabjan Elezi. Built with Next.js &amp; Firebase.
      </p>
    </footer>
  );
}
