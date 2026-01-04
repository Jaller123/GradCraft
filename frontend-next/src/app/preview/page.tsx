import { Suspense } from "react";
import PreviewPage from "../../features/cv/components/PreviewPage";

export default function PreviewRoute() {
  return (
    <Suspense fallback={<div />}>
      <PreviewPage />
    </Suspense>
  );
}
