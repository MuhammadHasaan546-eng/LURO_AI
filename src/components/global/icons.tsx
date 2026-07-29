import { LucideProps, PenOff } from "lucide-react";

type IconType = {
  [key: string]: (props: LucideProps) => React.JSX.Element;
};

const Icons: IconType = {
  icon: (props: LucideProps) => (
    <svg
      {...props}
      width="196"
      height="196"
      viewBox="0 0 196 196"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M73.9216 7.17157V38.204H122.078V7.17157H73.9216Z"
      />
    </svg>
  ),

  stars: (props: LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  ),

  menu: (props: LucideProps) => (
    <svg
      {...props}
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 1H15M1 5H15M1 9H15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),

  google: (props: LucideProps) => (
    <svg
      {...props}
      width="256"
      height="262"
      viewBox="0 0 256 262"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill="#4285F4"
        d="M255.45 133.5c0-11.21-.93-19.26-2.91-27.75H130.55v50.52h71.62c-1.46 12.35-10.42 30.82-29.09 43.85l-.26 1.73 40.42 31.32 2.8 0.28c25.75-23.73 40.61-58.68 40.61-99.95z"
      />
      <path
        fill="#34A853"
        d="M130.55 261.1c35.25 0 64.88-11.66 86.51-31.65l-43.22-33.33c-11.66 8.11-26.97 13.56-43.29 13.56-33.8 0-62.53-22.38-72.76-53.28l-1.63.14-42.06 32.55-.55 1.56c21.52 42.66 65.65 70.45 116.99 70.45z"
      />
      <path
        fill="#FBBC05"
        d="M57.79 156.4c-2.65-7.81-4.18-16.19-4.18-24.9 0-8.71 1.53-17.09 4.18-24.9l-.07-1.8-42.31-32.88-1.39.66C5.16 89.9 0 109.28 0 131.5s5.16 41.6 14.22 59.02l43.57-34.12z"
      />
      <path
        fill="#EA4335"
        d="M130.55 50.48c24.62 0 41.22 10.63 50.68 19.53l37.28-36.42C195.34 11.83 165.8 0 130.55 0 79.21 0 35.08 27.79 13.56 70.45l43.57 33.78c10.23-30.9 38.96-53.75 73.42-53.75z"
      />
    </svg>
  ),

  apple: (props: LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.67-.82 1.13-1.96.99-3.11-1 .04-2.19.67-2.88 1.48-.61.71-1.15 1.87-.99 2.99 1.12.09 2.22-.54 2.88-1.36Z" />
    </svg>
  ),

  discord: (props: LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z" />
    </svg>
  ),

  twitter: (props: LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),

  instagram: (props: LucideProps) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),

  gmail: (props: LucideProps) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <g fill="none" fillRule="evenodd">
        <g fillRule="nonzero">
          <path
            fill="#4285f4"
            d="M34.91 448.818h81.454V251.0L0 163.72v249.626c0 19.6 15.827 35.472 34.91 35.472z"
          />
          <path
            fill="#34a853"
            d="M395.636 448.818h81.455c19.083 0 34.909-15.872 34.909-35.472V163.727L395.636 251.0z"
          />
          <path
            fill="#fbbc04"
            d="M395.636 99.727V251.0L512 163.727v-43.636c0-40.582-46.327-63.564-78.255-38.4l-38.109 18.036z"
          />
        </g>
        <path
          fill="#ea4335"
          d="M116.364 251.0V99.727L256 204.455 395.636 99.727V251.0L256 355.727z"
        />
        <path
          fill="#c5221f"
          fillRule="nonzero"
          d="M0 117.182v46.545L116.364 251.0V99.727L78.255 71.691C46.327 46.527 0 69.509 0 110.091z"
        />
      </g>
    </svg>
  ),

  outlook: (props: LucideProps) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <path
        fill="#0364b8"
        d="M28.596 2H11.404A1.404 1.404 0 0 0 10 3.404v25.192A1.404 1.404 0 0 0 11.404 30h17.192A1.404 1.404 0 0 0 30 28.596V3.404A1.404 1.404 0 0 0 28.596 2z"
      />
      <path
        fill="#0a2767"
        d="M31.65 17.405A11.341 11.341 0 0 0 32 16a11.341 11.341 0 0 0-.35-1.405z"
      />
      <path fill="#28a8ea" d="M24 5h-7v21h7z" />
      <path fill="#0078d4" d="M10 5h7v6h-7z" />
      <path fill="#50d9ff" d="M24 5h6v6h-6z" />
      <path fill="#0364b8" d="M24 17-7-6h-7v617 6 10.832 1.768z" />
      <path fill="none" d="M10.031 5H30" />
      <path fill="#0078d4" d="M10 11h7v6h-7z" />
      <path fill="#064a8c" d="M10 17h7v6h-7z" />
      <path fill="#0078d4" d="M24 17h6v6h-6z" />
      <path
        fill="#0a2767"
        d="M20.19 25.218-11.793-8.6.495-.87s10.745 6.11 11.233 6.38z"
      />
      <path
        fill="#1490df"
        d="M31.667 16.577-.014.008-.003.002-10.838 6.11a11.341 11.341 0 0 0-.35 1.405z"
      />
      <path
        fill="#28a8ea"
        d="M8.35 16.59v-.01h-.011-.03-.02A.65.65 0 0 0 8 17v7"
      />
      <path
        fill="#182467"
        d="M18 24.667V8.333A1.337 1.337 0 0 0 16.667 7H10.03v7.456l-1.392 1.05z"
      />
    </svg>
  ),
};

export default Icons;
