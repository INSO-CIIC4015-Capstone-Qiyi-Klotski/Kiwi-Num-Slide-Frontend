// src/app/levels/create/page.jsx
import PageLayout from "@/components/layout/PageLayout";
import LevelCreateClient from "@/components/levels/create/LevelCreateClient";


export default function LevelCreatePage() {
  return (
    <PageLayout
      title="Create Level"
      subtitle="Design a custom level: choose size, numbers, operators and target."
      backHref="/levels/browse"
    >
      <LevelCreateClient />
    </PageLayout>
  );
}
