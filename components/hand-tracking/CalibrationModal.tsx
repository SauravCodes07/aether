"use client";

import React, { useState } from "react";

export default function CalibrationModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="btn" onClick={() => setOpen(true)}>
        Calibrate
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-black/50 absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-md">
            <h3 className="text-lg font-medium mb-2">Calibration</h3>
            <p className="text-sm mb-4">Follow the on-screen prompts to calibrate your hands.</p>
            <ol className="text-sm list-decimal list-inside space-y-2">
              <li>Hold an open palm to the camera for 2 seconds.</li>
              <li>Pinch index and thumb once.</li>
              <li>Make a fist and release.</li>
            </ol>
            <div className="mt-4 flex justify-end">
              <button className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
