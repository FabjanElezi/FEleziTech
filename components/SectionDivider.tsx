export default function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className="relative w-full h-px overflow-visible flex items-center justify-center my-2">
      <div
        className="absolute inset-x-0 h-px"
        style={{
          background: flip
            ? 'linear-gradient(to left, transparent, rgba(6,182,212,0.25) 30%, rgba(124,58,237,0.4) 50%, rgba(6,182,212,0.25) 70%, transparent)'
            : 'linear-gradient(to right, transparent, rgba(124,58,237,0.25) 30%, rgba(6,182,212,0.4) 50%, rgba(124,58,237,0.25) 70%, transparent)',
        }}
      />
      <div
        className="relative z-10 w-1.5 h-1.5 rounded-full"
        style={{
          background: flip ? '#06b6d4' : '#7c3aed',
          boxShadow: flip ? '0 0 8px rgba(6,182,212,0.8)' : '0 0 8px rgba(124,58,237,0.8)',
        }}
      />
    </div>
  );
}
