import { Suspense } from "react";

import { Databases } from "@/components/Databases";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <Suspense fallback={<div>Loading...</div>}>
        <Databases />
      </Suspense>
    </div>
  );
}
