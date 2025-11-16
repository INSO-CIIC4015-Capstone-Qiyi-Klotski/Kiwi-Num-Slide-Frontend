// src/components/users/UsersBrowsePageClient.jsx
"use client";

import UsersFilters from "./UsersFilters";
import UsersList from "./UsersList";

export default function UsersBrowsePageClient() {
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
      <UsersList />
    </div>
  );
}
