export function Stats({ items }: { items: { value: string; label: string }[] }) {
  return (
    <div className="stats">
      {items.map((s) => (
        <div key={s.label} className="stat">
          <div className="stat-n serif">{s.value}</div>
          <div className="stat-l">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
