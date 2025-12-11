// src/components/users/UsersBrowsePageClient.jsx
"use client";

import { useSearchParams } from "next/navigation";
import UsersFilters from "./UsersFilters";
import UsersList from "./UsersList";

export default function UsersBrowsePageClient() {
  const searchParams = useSearchParams();
  // Use the current browse URL (with filters) as the backTo for user profiles
  const backTo = `/users/browse${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

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
      <UsersFilters />
      <UsersList backTo={backTo} />
    </div>
  );
}
