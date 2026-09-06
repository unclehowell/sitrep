import { createFileRoute } from "@tanstack/react-router";
import { DocketApp } from "@/components/docket/docket-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <DocketApp />;
}
