// src/components/levels/LevelsBrowsePageClient.jsx
"use client";

import LevelsFilters from "./LevelsFilters";
import LevelsList from "./LevelsList";

export default function LevelsBrowsePageClient() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <LevelsFilters />
      <LevelsList />
    </div>
  );
}
