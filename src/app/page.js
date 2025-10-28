"use client";
import MenuButton from "../components/MenuButton";
import HomePageLayout from "../components/layout/HomePageLayout";

export default function Home() {
  return (
    <HomePageLayout>
      <MenuButton href="/daily" data-testid="btn-daily">
        Daily
      </MenuButton>
      <MenuButton href="/levels/pae2">
        Level Select
      </MenuButton>
    </HomePageLayout>
  );
}