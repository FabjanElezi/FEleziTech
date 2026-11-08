export default function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className="relative w-full h-px overflow-visible flex items-center justify-center my-1">
      <div
        className="absolute inset-x-0 h-px"
        style={{
          background: flip
            ? 'linear-gradient(to left, transparent, rgba(6,182,212,0.25) 30%, rgba(8,145,178,0.4) 50%, rgba(6,182,212,0.25) 70%, transparent)'
            : 'linear-gradient(to right, transparent, rgba(8,145,178,0.25) 30%, rgba(6,182,212,0.4) 50%, rgba(8,145,178,0.25) 70%, transparent)',
        }}
      />
    </div>
  );
}
