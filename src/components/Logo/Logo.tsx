import "./Logo.css";

interface LogoProps {
  variant?: "full" | "mark";
  className?: string;
}

export default function Logo({
  variant = "full",
  className = "",
}: LogoProps) {
  return (
    <span
      className={`logo logo--${variant} ${className}`}
    >
      <img
        src="/images/aknm-logo.png"
        alt="AKNM"
      />
    </span>
  );
}