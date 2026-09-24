import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

function Svg({ children, ...props }: P) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CalendarPlusIcon = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <path d="M16 2v4M8 2v4M3 10h18M12 14v5M9.5 16.5h5" />
  </Svg>
);

export const TicketIcon = (p: P) => (
  <Svg {...p}>
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M13 6v2M13 11v2M13 16v2" />
  </Svg>
);

export const AlertIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v5M12 16h.01" />
  </Svg>
);

export const CheckCircleIcon = (p: P) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="m8 12 3 3 5-6" />
  </Svg>
);

export const EuroIcon = (p: P) => (
  <Svg {...p}>
    <path d="M18 7a6.5 6.5 0 1 0 0 10" />
    <path d="M4 10h9M4 14h8" />
  </Svg>
);

export const FlaskIcon = (p: P) => (
  <Svg {...p}>
    <path d="M9 3h6M10 3v6L4.5 18.5A1.8 1.8 0 0 0 6 21h12a1.8 1.8 0 0 0 1.5-2.5L14 9V3" />
    <path d="M7 15h10" />
  </Svg>
);
