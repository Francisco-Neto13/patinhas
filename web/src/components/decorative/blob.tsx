export function Blob({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M45.8,-58.6C58.9,-49.6,68.6,-34.5,72.4,-17.9C76.1,-1.3,73.9,16.8,65.6,31.2C57.3,45.6,42.9,56.3,26.9,63.2C10.9,70.1,-6.7,73.2,-22.6,68.9C-38.5,64.6,-52.7,52.9,-61.6,38.1C-70.5,23.3,-74.1,5.4,-70.6,-10.8C-67.1,-27,-56.5,-41.5,-43.1,-50.8C-29.7,-60.1,-13.5,-64.2,2.6,-67.3C18.7,-70.4,32.7,-67.6,45.8,-58.6Z"
        transform="translate(100 100)"
      />
    </svg>
  );
}

export function PawPrintScatter({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <circle cx="8" cy="8" r="2.2" />
      <circle cx="13" cy="6.5" r="2" />
      <circle cx="17.5" cy="9" r="1.8" />
      <circle cx="5" cy="12" r="1.6" />
      <path d="M12 12c-3 0-6 2.4-6 5.4 0 2 1.6 3.2 3.4 2.6.9-.3 1.7-.3 2.6 0 1.8.6 3.4-.6 3.4-2.6C15.4 14.4 15 12 12 12Z" />
    </svg>
  );
}
