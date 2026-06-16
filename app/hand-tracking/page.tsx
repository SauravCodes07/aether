import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";

const HandTrackingApp = dynamic(
  () => import("@/components/hand-tracking/HandTrackingApp"),
  { ssr: false }
);

export default function Page() {
  return (
    <main className="p-6">
      <h1 className="mb-4 text-2xl font-semibold">Hand Tracking Workspace</h1>
      <Card>
        <HandTrackingApp />
      </Card>
    </main>
  );
}
