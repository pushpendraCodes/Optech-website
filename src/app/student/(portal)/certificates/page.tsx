import { CERTIFICATES } from "@/lib/student-data";

export const metadata = { title: "Certificates" };

export default function CertificatesPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-sans text-3xl font-semibold tracking-tight">Certificates</h1>
      <ul className="mt-6 space-y-3">
        {CERTIFICATES.map((item) => (
          <li key={item.id} className="card-surface flex items-center justify-between p-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                {item.kind}
              </p>
              <p className="mt-1 font-sans text-lg font-semibold">{item.title}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                Issued {item.issued}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
