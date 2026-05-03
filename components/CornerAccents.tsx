interface Props {
  color?: string;
  size?: number;
  inset?: number;
}

export default function CornerAccents({
  color = 'rgba(124, 58, 237, 0.38)',
  size = 10,
  inset = 8,
}: Props) {
  const shared: React.CSSProperties = {
    position: 'absolute',
    width: size,
    height: size,
    pointerEvents: 'none',
  };
  return (
    <>
      <span style={{ ...shared, top: inset, left: inset, borderTop: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ ...shared, top: inset, right: inset, borderTop: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
      <span style={{ ...shared, bottom: inset, left: inset, borderBottom: `1px solid ${color}`, borderLeft: `1px solid ${color}` }} />
      <span style={{ ...shared, bottom: inset, right: inset, borderBottom: `1px solid ${color}`, borderRight: `1px solid ${color}` }} />
    </>
  );
}
