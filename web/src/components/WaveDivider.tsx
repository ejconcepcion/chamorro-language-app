export function WaveDivider({ fill = '#F5F0E8', flip = false }: { fill?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 1440 54"
      className="w-full block"
      style={{ transform: flip ? 'scaleY(-1)' : undefined, marginBottom: -1 }}
      preserveAspectRatio="none"
    >
      <path
        d="M0 27C120 45 240 9 360 27C480 45 600 9 720 27C840 45 960 9 1080 27C1200 45 1320 9 1440 27L1440 54L0 54Z"
        fill={fill}
      />
    </svg>
  )
}
