"use client";

import { useState } from "react";
import { UsersService } from "@/services/users.service";

function JSONView({ data }) {
  return (
    <pre
      style={{
        background: "#0b1220",
        color: "#c9e4ff",
        padding: 12,
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 12,
      }}
    >
      {data ? JSON.stringify(data, null, 2) : "Sin resultados aún..."}
    </pre>
  );
}

export default function UsersTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Inputs identificados (con etiquetas)
  const [seedLimit, setSeedLimit] = useState(200);

  const [patchName, setPatchName] = useState("");
  const [patchAvatar, setPatchAvatar] = useState("");

  const [publicUserId, setPublicUserId] = useState("");
  const [followUserId, setFollowUserId] = useState("");
  const [unfollowUserId, setUnfollowUserId] = useState("");

  const [followingLimit, setFollowingLimit] = useState(20);
  const [followingCursor, setFollowingCursor] = useState("");

  const [followersLimit, setFollowersLimit] = useState(20);
  const [followersCursor, setFollowersCursor] = useState("");

  const [likesLimit, setLikesLimit] = useState(20);
  const [likesCursor, setLikesCursor] = useState("");

  const [solvesLimit, setSolvesLimit] = useState(20);
  const [solvesCursor, setSolvesCursor] = useState("");

  async function run(action, fn) {
    try {
      setLoading(true);
      const res = await fn();
      setResult({ action, ...res });
    } catch (e) {
      setResult({ action, ok: false, error: String(e) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 8 }}>Users Test</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Página de pruebas para endpoints de <code>/users</code>. Debes estar logueado (cookies).
      </p>

      {/* SSG SEED */}
      <section style={card}>
        <h2 style={h2}>GET /users/ssg-seed</h2>
        <div style={row}>
          <label style={label}>
            <span>limit</span>
            <input
              id="ssg-limit"
              type="number"
              style={input}
              value={seedLimit}
              onChange={(e) => setSeedLimit(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() => run("users.ssgSeed", () => UsersService.ssgSeed({ limit: parseInt(seedLimit, 10) }))}
          >
            Fetch seed
          </button>
        </div>
      </section>

      {/* ME */}
      <section style={card}>
        <h2 style={h2}>GET /users/me</h2>
        <div style={row}>
          <button style={btn} disabled={loading} onClick={() => run("users.me", () => UsersService.me())}>
            My profile
          </button>
        </div>
      </section>

      {/* PATCH ME */}
      <section style={card}>
        <h2 style={h2}>PATCH /users/me</h2>
        <div style={row}>
          <label style={label}>
            <span>name</span>
            <input
              id="patch-name"
              style={input}
              placeholder="Nuevo nombre (opcional)"
              value={patchName}
              onChange={(e) => setPatchName(e.target.value)}
            />
          </label>
          <label style={label}>
            <span>avatar_key</span>
            <input
              id="patch-avatar"
              style={input}
              placeholder="avatar_key (opcional)"
              value={patchAvatar}
              onChange={(e) => setPatchAvatar(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("users.patchMe", () =>
                UsersService.patchMe({
                  name: patchName || undefined,
                  avatar_key: patchAvatar || undefined,
                })
              )
            }
          >
            Save
          </button>
        </div>
      </section>

      {/* PUBLIC PROFILE */}
      <section style={card}>
        <h2 style={h2}>GET /users/:user_id</h2>
        <div style={row}>
          <label style={label}>
            <span>user_id</span>
            <input
              id="public-user-id"
              type="number"
              style={input}
              placeholder="e.g. 123"
              value={publicUserId}
              onChange={(e) => setPublicUserId(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() => run("users.getPublic", () => UsersService.getPublic(publicUserId))}
          >
            Fetch public
          </button>
        </div>
      </section>

      {/* FOLLOW */}
      <section style={card}>
        <h2 style={h2}>POST /users/:user_id/follow</h2>
        <div style={row}>
          <label style={label}>
            <span>user_id</span>
            <input
              id="follow-user-id"
              type="number"
              style={input}
              placeholder="e.g. 123"
              value={followUserId}
              onChange={(e) => setFollowUserId(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() => run("users.follow", () => UsersService.follow(followUserId))}
          >
            Follow
          </button>
        </div>
      </section>

      {/* UNFOLLOW */}
      <section style={card}>
        <h2 style={h2}>DELETE /users/:user_id/follow</h2>
        <div style={row}>
          <label style={label}>
            <span>user_id</span>
            <input
              id="unfollow-user-id"
              type="number"
              style={input}
              placeholder="e.g. 123"
              value={unfollowUserId}
              onChange={(e) => setUnfollowUserId(e.target.value)}
            />
          </label>
          <button
            style={btnDanger}
            disabled={loading}
            onClick={() => run("users.unfollow", () => UsersService.unfollow(unfollowUserId))}
          >
            Unfollow
          </button>
        </div>
      </section>

      {/* MY FOLLOWING */}
      <section style={card}>
        <h2 style={h2}>GET /users/me/following</h2>
        <div style={row}>
          <label style={label}>
            <span>limit</span>
            <input
              id="following-limit"
              type="number"
              style={input}
              value={followingLimit}
              onChange={(e) => setFollowingLimit(e.target.value)}
            />
          </label>
          <label style={label}>
            <span>cursor</span>
            <input
              id="following-cursor"
              style={input}
              placeholder="(opcional)"
              value={followingCursor}
              onChange={(e) => setFollowingCursor(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("users.myFollowing", () =>
                UsersService.myFollowing({ limit: parseInt(followingLimit, 10), cursor: followingCursor || undefined })
              )
            }
          >
            Fetch following
          </button>
        </div>
      </section>

      {/* MY FOLLOWERS */}
      <section style={card}>
        <h2 style={h2}>GET /users/me/followers</h2>
        <div style={row}>
          <label style={label}>
            <span>limit</span>
            <input
              id="followers-limit"
              type="number"
              style={input}
              value={followersLimit}
              onChange={(e) => setFollowersLimit(e.target.value)}
            />
          </label>
          <label style={label}>
            <span>cursor</span>
            <input
              id="followers-cursor"
              style={input}
              placeholder="(opcional)"
              value={followersCursor}
              onChange={(e) => setFollowersCursor(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("users.myFollowers", () =>
                UsersService.myFollowers({ limit: parseInt(followersLimit, 10), cursor: followersCursor || undefined })
              )
            }
          >
            Fetch followers
          </button>
        </div>
      </section>

      {/* MY PUZZLE LIKES */}
      <section style={card}>
        <h2 style={h2}>GET /users/me/puzzle-likes</h2>
        <div style={row}>
          <label style={label}>
            <span>limit</span>
            <input
              id="likes-limit"
              type="number"
              style={input}
              value={likesLimit}
              onChange={(e) => setLikesLimit(e.target.value)}
            />
          </label>
          <label style={label}>
            <span>cursor</span>
            <input
              id="likes-cursor"
              style={input}
              placeholder="(opcional)"
              value={likesCursor}
              onChange={(e) => setLikesCursor(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("users.myPuzzleLikes", () =>
                UsersService.myPuzzleLikes({ limit: parseInt(likesLimit, 10), cursor: likesCursor || undefined })
              )
            }
          >
            Fetch likes
          </button>
        </div>
      </section>

      {/* MY SOLVES */}
      <section style={card}>
        <h2 style={h2}>GET /users/me/solves</h2>
        <div style={row}>
          <label style={label}>
            <span>limit</span>
            <input
              id="solves-limit"
              type="number"
              style={input}
              value={solvesLimit}
              onChange={(e) => setSolvesLimit(e.target.value)}
            />
          </label>
          <label style={label}>
            <span>cursor</span>
            <input
              id="solves-cursor"
              style={input}
              placeholder="(opcional)"
              value={solvesCursor}
              onChange={(e) => setSolvesCursor(e.target.value)}
            />
          </label>
          <button
            style={btn}
            disabled={loading}
            onClick={() =>
              run("users.mySolves", () =>
                UsersService.mySolves({ limit: parseInt(solvesLimit, 10), cursor: solvesCursor || undefined })
              )
            }
          >
            Fetch solves
          </button>
        </div>
      </section>

      {/* RESULT */}
      <section style={card}>
        <h2 style={h2}>Resultado</h2>
        {loading ? <p>Cargando…</p> : <JSONView data={result} />}
      </section>
    </div>
  );
}

const card = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 16,
  marginBottom: 16,
  background: "#fff",
};

const h2 = { fontSize: 18, fontWeight: 700, margin: 0, marginBottom: 12 };

const row = { display: "flex", gap: 8, flexWrap: "wrap" };

const input = {
  padding: "8px 10px",
  border: "1px solid #d1d5db",
  borderRadius: 8,
  minWidth: 220,
};

const label = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 12,
  color: "#374151",
  minWidth: 220,
};

const btn = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #111827",
  background: "#111827",
  color: "#fff",
  cursor: "pointer",
  height: 40,
  alignSelf: "end",
};

const btnDanger = {
  ...btn,
  background: "#7f1d1d",
  border: "1px solid #7f1d1d",
};
