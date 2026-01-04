import Link from "next/link";
import { IntentForm } from "@/components/intents/IntentForm";

export default function NewIntentPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <Link
          href="/intents"
          className="text-sm text-primary hover:text-blue-800 flex items-center gap-1 mb-2"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Intents
        </Link>
        <h1 className="text-3xl font-bold text-text-primary">Create Intent</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Submit a new trading intent for validation and execution
        </p>
      </div>

      {/* Form */}
      <IntentForm />
    </div>
  );
}
