import { Card } from "@/components/ui/card";
import HandTrackingApp from "@/components/hand-tracking/HandTrackingApp";

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
