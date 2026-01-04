import { Suspense } from "react";
import CvPageClient from "../../features/cv/CvPageClient";

export default function CvPage() {
  return (
    <Suspense fallback={<div />}>
      <CvPageClient />
    </Suspense>
  );
}
