import { EnrollFlow } from "@/components/catalog/EnrollFlow";

type Props = { params: Promise<{ slug: string }> };

export default async function EnrollPage({ params }: Props) {
  const { slug } = await params;
  return <EnrollFlow slug={slug} />;
}
