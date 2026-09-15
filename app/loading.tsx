export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-11 h-11 rounded-full border-2 animate-spin"
          style={{
            borderColor: 'rgba(37,99,235,0.15)',
            borderTopColor: '#2563eb',
          }}
        />
        <p className="text-slate-600 text-xs tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}
