"use client";

import React from "react";

export default function PermissionsFallback() {
  return (
    <div className="p-6 border rounded-md bg-yellow-50">
      <h3 className="text-lg font-medium mb-2">Camera Permission Required</h3>
      <p className="text-sm mb-4">
        Hand tracking requires access to your webcam. Please enable camera permissions in your browser and reload the
        page.
      </p>
      <p className="text-sm">If you previously denied permission, check your browser site settings to re-enable it.</p>
    </div>
  );
}
