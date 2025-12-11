import { Suspense } from "react";
import RankingsClient from "./RankingsClient";

export default function RankingsPage() {
  return (
    <Suspense fallback={null}>
      <RankingsClient />
    </Suspense>
  );
}
