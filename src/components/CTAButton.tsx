export default function CTAButton() {
  return (
    <button
      type="button"
      className="group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-full border-0 bg-transparent p-2"
    >
      <span
        aria-hidden="true"
        className="absolute bottom-[5px] left-2 top-[5px] z-0 w-[calc(100%-76px)] rounded-full bg-white transition-[width] duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:w-[calc(100%-16px)] md:w-[calc(100%-82px)]"
      />
      <span className="relative z-[1] whitespace-nowrap px-8 py-3 text-base font-medium text-[#111] md:px-10 md:py-4 md:text-lg">
        Start a project now
      </span>
      <span className="relative z-[1] flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#E86100] transition-transform duration-[400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:-translate-x-[7px] md:h-[54px] md:w-[54px]">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </span>
    </button>
  );
}
