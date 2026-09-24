import { site } from "@/lib/site";

export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 34 34" aria-hidden="true" focusable="false">
      <path
        d="M9 2h16a7 7 0 0 1 7 7v12a7 7 0 0 1-7 7H14.5L8 32.5V27.6A7 7 0 0 1 2 21V9a7 7 0 0 1 7-7z"
        fill="#89CFF0"
      />
      <path d="M17 9.5v11M11.5 15h11" stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="brand-inner">
      <LogoMark />
      <span className="brand-word">
        {site.name}
        <span>{site.suffix}</span>
      </span>
    </span>
  );
}
