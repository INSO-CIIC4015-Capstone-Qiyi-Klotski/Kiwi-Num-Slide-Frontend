// src/components/levels/LevelsBrowsePageClient.jsx
"use client";

import { useSearchParams } from "next/navigation";
import LevelsFilters from "./LevelsFilters";
import LevelsList from "./LevelsList";

export default function LevelsBrowsePageClient() {
  const searchParams = useSearchParams();
  // Use the current browse URL (with filters) as the backTo for level pages
  const backTo = `/levels/browse${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

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
      <LevelsList backTo={backTo} />
    </div>
  );
}
