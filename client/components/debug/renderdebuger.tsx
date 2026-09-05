'use client';

import { useEffect } from 'react';

export const RenderTracker = ({ componentName }: { componentName: string }) => {
  useEffect(() => {
    console.log(`🔄 ${componentName} rendered at:`, new Date().toISOString());
    return () => console.log(`♻️ ${componentName} cleanup at:`, new Date().toISOString());
  });
  return null;
};

// Create a wrapper component for debugging
export const DebugWrapper = ({ componentName, children }: { componentName: string, children: React.ReactNode }) => {
  return (
    <>
      <RenderTracker componentName={componentName} />
      {children}
    </>
  );
};