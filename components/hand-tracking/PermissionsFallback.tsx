"use client";

import React from "react";

export default function PermissionsFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-aether-error/10 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-aether-error"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 6l12 12"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-aether-text mb-2">
        Camera Permission Required
      </h2>
      <p className="text-sm text-aether-text-muted max-w-md mb-6">
        Hand tracking requires access to your webcam. Please enable camera
        permissions in your browser and reload the page. Your video feed
        stays local and is never uploaded.
      </p>

      <div className="space-y-3 text-left bg-slate-900 rounded-lg p-4 border border-slate-700 text-xs font-mono text-slate-400 max-w-sm w-full">
        <p className="text-slate-300 font-medium text-sm">
          How to enable:
        </p>
        <ol className="list-decimal list-inside space-y-2">
          <li>
            {"Click the camera icon in your browser's address bar."}
          </li>
          <li>Select Allow for camera access.</li>
          <li>Reload this page.</li>
        </ol>
      </div>

      <button
        className="mt-6 btn-primary"
        onClick={() => window.location.reload()}
      >
        Reload Page
      </button>
    </div>
  );
}