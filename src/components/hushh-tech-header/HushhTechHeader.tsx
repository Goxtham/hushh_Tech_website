/**
 * HushhTechHeader — Reusable sticky header component
 * Glass-blur nav bar with Hushh logo, brand name, and help button.
 *
 * Usage:
 *   <HushhTechHeader onHelpClick={() => console.log('help')} />
 *   <HushhTechHeader fixed={false} />  // non-fixed variant
 */
import React from "react";
import hushhLogo from "../images/Hushhogo.png";

interface HushhTechHeaderProps {
  /** Callback when help icon is clicked */
  onHelpClick?: () => void;
  /** Whether the header is fixed to top (default: true) */
  fixed?: boolean;
  /** Extra classes on the root container */
  className?: string;
}

const HushhTechHeader: React.FC<HushhTechHeaderProps> = ({
  onHelpClick,
  fixed = true,
  className = "",
}) => {
  const positionClasses = fixed
    ? "fixed top-0 left-0 right-0 z-50"
    : "relative z-0";

  return (
    <div
      className={`${positionClasses} bg-white/90 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-gray-50 transition-all duration-300 ${className}`}
    >
      {/* Logo + Brand */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border border-black rounded-lg flex items-center justify-center bg-white overflow-hidden">
          <img
            src={hushhLogo}
            alt="Hushh Logo"
            className="w-7 h-7 object-contain"
          />
        </div>
        <span className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-black pt-0.5">
          Hushh Technologies
        </span>
      </div>

      {/* Help button */}
      <button
        onClick={onHelpClick}
        className="text-gray-500 hover:text-black transition-colors"
        aria-label="Help"
        tabIndex={0}
      >
        <span className="material-symbols-outlined !text-[1.35rem]">help</span>
      </button>
    </div>
  );
};

export default HushhTechHeader;
