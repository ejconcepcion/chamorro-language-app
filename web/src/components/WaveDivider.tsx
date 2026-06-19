// bg = color above the wave (prevents subpixel gap), fill = color below
export function WaveDivider({ fill = '#F5F0E8', bg = 'transparent' }: { fill?: string; bg?: string }) {
  return (
    <svg
      viewBox="0 0 1440 56"
      className="w-full block"
      style={{ backgroundColor: bg }}
      preserveAspectRatio="none"
    >
      <path
        d="M0 28C120 48 240 8 360 28C480 48 600 8 720 28C840 48 960 8 1080 28C1200 48 1320 8 1440 28L1440 56L0 56Z"
        fill={fill}
      />
    </svg>
  )
}
