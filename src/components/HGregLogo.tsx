interface HGregLogoProps {
  className?: string;
  textClassName?: string;
  showLines?: boolean;
}

export default function HGregLogo({ className = '', textClassName = '', showLines = true }: HGregLogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2">
        {showLines && <div className="w-5 h-[1px] bg-steel/50" />}
        <span className={`text-[11px] font-bold tracking-[0.2em] uppercase ${textClassName || 'text-steel'}`}>
          <span className="text-amber">H</span>GREG
        </span>
        {showLines && <div className="w-5 h-[1px] bg-steel/50" />}
      </div>
      <span className={`text-lg font-black tracking-[0.1em] leading-none mt-0.5 ${textClassName || 'text-chrome'}`}>
        TRUCKS
      </span>
    </div>
  );
}
