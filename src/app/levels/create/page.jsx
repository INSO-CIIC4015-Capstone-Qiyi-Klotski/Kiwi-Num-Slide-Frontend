// src/app/levels/create/page.jsx
import PageLayout from "@/components/layout/PageLayout";
import LevelCreateClient from "@/components/levels/create/LevelCreateClient";

export default async function LevelCreatePage({ searchParams }) {
  const backHref = searchParams?.backTo || "/levels/pae2";
  
  return (
    <PageLayout
      title="Create Level"
      subtitle="Design a custom level: choose size, numbers, operators and target."
      backHref={backHref}
    >
      <LevelCreateClient />
    </PageLayout>
  );
}
