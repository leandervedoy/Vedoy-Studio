import type { Metadata } from "next";
import { VedoyAiApp } from "@/components/vedoy-ai/vedoy-ai-app";
import "./vedoy-ai.css";

export const metadata: Metadata = {
  title: "Vedøy AI",
  description: "Et personlig arbeidsrom for nyttige AI-assistenter."
};

export default function VedoyAiPage() {
  return <VedoyAiApp />;
}
