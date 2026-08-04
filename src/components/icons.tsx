import type { SVGProps } from 'react'

const defaults = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const SettingsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.13.6.65 1 1.26 1H21v4h-.34c-.61 0-1.13.4-1.26 1Z"/></svg>
)

export const SparkIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></svg>
)

export const ShuffleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="m4 4 5 5"/></svg>
)

export const ChevronLeftIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><path d="m15 18-6-6 6-6"/></svg>
)

export const ChevronRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><path d="m9 18 6-6-6-6"/></svg>
)

export const LightbulbIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 16 14c-1 .8-1 1.7-1 2H9c0-.7-.1-1.1-.5-1.5Z"/></svg>
)

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...defaults} {...props}><path d="m6 6 12 12M18 6 6 18"/></svg>
)
