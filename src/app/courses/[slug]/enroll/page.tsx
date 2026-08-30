import { Suspense } from "react";
import { EnrollFlow } from "@/components/catalog/EnrollFlow";

type Props = { params: Promise<{ slug: string }> };

export default async function EnrollPage({ params }: Props) {
  const { slug } = await params;
  return (
    <Suspense>
      <EnrollFlow slug={slug} />
    </Suspense>
  );
}
