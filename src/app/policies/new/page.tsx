import Link from "next/link";
import { PolicyForm } from "@/components/policies/PolicyForm";

export default function NewPolicyPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <Link
          href="/policies"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2"
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
          Back to Policies
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Policy</h1>
        <p className="mt-2 text-sm text-gray-600">
          Define a new compliance policy or trading rule
        </p>
      </div>

      {/* Policy Form */}
      <PolicyForm />
    </div>
  );
}
