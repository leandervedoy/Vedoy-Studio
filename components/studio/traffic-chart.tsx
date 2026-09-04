import type { StudioMetricPoint } from "@/lib/types";

export function TrafficChart({ points }: { points: StudioMetricPoint[] }) {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="studio-chart" role="img" aria-label="Trafikk de siste syv dagene">
      <div className="studio-chart__plot">
        {points.map((point) => (
          <div key={point.label} className="studio-chart__column">
            <span style={{ height: `${Math.max(8, (point.value / max) * 100)}%` }}><i>{point.value}</i></span>
            <small>{point.label}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
