"use client";

import React, { useState, useCallback } from "react";

type CalibrationResult = {
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
};

type CalibrationModalProps = {
  onApply: (cal: CalibrationResult) => void;
  onClose: () => void;
};

const STEPS = [
  {
    title: "Open Palm",
    instruction:
      "Hold an open palm in front of the camera at center screen. Keep it steady for 2 seconds.",
    icon: "🖐",
  },
  {
    title: "Pinch",
    instruction:
      "Pinch your index finger and thumb together. Hold for 1 second.",
    icon: "🤏",
  },
  {
    title: "Fist",
    instruction:
      "Make a fist and hold it at center screen for 1 second.",
    icon: "✊",
  },
];

export default function CalibrationModal({
  onApply,
  onClose,
}: CalibrationModalProps) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setCompleted(true);
      // Apply default calibration (identity)
      onApply({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });
    }
  }, [step, onApply]);

  const handleReset = useCallback(() => {
    onApply({ offsetX: 0, offsetY: 0, scaleX: 1, scaleY: 1 });
    onClose();
  }, [onApply, onClose]);

  const currentStep = STEPS[step];

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-700 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-aether-text">
          Calibration
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          ✕
        </button>
      </div>

      {completed ? (
        <div className="space-y-3 text-center">
          <div className="text-4xl">✅</div>
          <p className="text-green-400 font-medium">
            Calibration Complete
          </p>
          <p className="text-sm text-slate-400">
            Your tracking has been calibrated. Adjust the dead zone and
            smoothing settings as needed.
          </p>
          <button
            className="btn-primary"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className={`flex-1 h-1 rounded-full transition-colors ${
                  i <= step ? "bg-aether-accent" : "bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          <div className="text-center space-y-3">
            <div className="text-4xl">{currentStep.icon}</div>
            <h4 className="text-aether-accent font-medium">
              {currentStep.title}
            </h4>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              {currentStep.instruction}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              className="btn-secondary text-xs"
              onClick={handleReset}
            >
              Skip & Reset
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  className="btn-secondary text-xs"
                  onClick={() => setStep(step - 1)}
                >
                  Back
                </button>
              )}
              <button
                className="btn-primary text-xs"
                onClick={handleNext}
              >
                {step < STEPS.length - 1 ? "Next" : "Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}