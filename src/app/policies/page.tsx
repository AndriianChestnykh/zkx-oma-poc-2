import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PolicyList } from "@/components/policies/PolicyList";

export default function PoliciesPage() {

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Policies</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Configure compliance policies and trading rules
          </p>
        </div>
        <Link href="/policies/new">
          <Button>Create Policy</Button>
        </Link>
      </div>

      {/* Policies List */}
      <PolicyList />

      {/* Info */}
      <div className="rounded-md bg-purple-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-purple-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-purple-800">
              Policy Information
            </h3>
            <div className="mt-2 text-sm text-purple-700">
              <p>
                Policies are evaluated in priority order (lower = first). All enabled
                policies must pass for an intent to be validated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
