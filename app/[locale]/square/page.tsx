import type { Metadata } from "next";
import VelmereSquareClient from "@/components/square/VelmereSquareClient";

export const metadata: Metadata = {
  title: "Velmère Square",
  description: "Community notes, drops and access updates from Velmère.",
};

export default function SquarePage() {
  return <VelmereSquareClient />;
}
