import Image from "next/image";
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,.28),transparent_45%),linear-gradient(135deg,#050505,#17121f)]" />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-black/45 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex justify-center">
          <Image
            src="/icons/logo-dark.png"
            alt="Luro"
            width={44}
            height={44}
            priority
          />
        </div>
        {children}
      </div>
    </main>
  );
}
