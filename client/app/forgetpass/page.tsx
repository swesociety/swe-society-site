"use client";
import { Suspense } from "react";
import ForgetPassPageContent from "./ForgetPassPageContent";

const ForgetPassPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgetPassPageContent />
    </Suspense>
  );
};

export default ForgetPassPage;
