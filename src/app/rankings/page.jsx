"use client";

import MenuButton from "@/components/MenuButton";
import PageLayout from "@/components/layout/PageLayout";

export default function RankingsPage() {
  return (
    <PageLayout
      title="Rankings"
      subtitle="Choose what you want to rank"
      titleFontSize="clamp(32px, 6vw, 72px)"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          maxWidth: 300,
          margin: "32px auto",
        }}
      >
        {/* Players Ranking */}
        <MenuButton href="/users/browse?sort=solved&order=desc">
          Players Ranking
        </MenuButton>

        <MenuButton href="/levels/browse?sort=likes&order=desc">
          Levels Ranking
        </MenuButton>
      </div>
    </PageLayout>
  );
}
