import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

export default function NewIntentPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div>
        <Link
          href="/intents"
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
          Back to Intents
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Create Intent</h1>
        <p className="mt-2 text-sm text-gray-600">
          Submit a new trading intent for validation and execution
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Intent Details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <Input
              label="User Address"
              type="text"
              placeholder="0x..."
              helperText="Ethereum address of the user"
            />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Asset In"
                type="text"
                placeholder="0x..."
                helperText="Token address"
              />
              <Input
                label="Asset Out"
                type="text"
                placeholder="0x..."
                helperText="Token address"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Amount In"
                type="text"
                placeholder="1000000000000000000"
                helperText="Wei/smallest unit"
              />
              <Input
                label="Min Amount Out"
                type="text"
                placeholder="1000000000000000000"
                helperText="Minimum acceptable output"
              />
            </div>

            <Select
              label="Venue"
              options={[
                { value: "", label: "Select a venue" },
                { value: "uniswap-v3", label: "Uniswap V3" },
                { value: "curve", label: "Curve" },
                { value: "balancer", label: "Balancer" },
              ]}
            />

            <Input
              label="Deadline"
              type="number"
              placeholder="1735689600"
              helperText="Unix timestamp"
            />

            <Input
              label="Nonce"
              type="number"
              placeholder="0"
              helperText="Unique nonce for replay protection"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit" size="lg">
                Create Intent
              </Button>
              <Link href="/intents">
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info */}
      <div className="rounded-md bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Step 1: UI Only
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                This form is a placeholder for Step 1. Database integration and actual
                intent creation will be implemented in Step 2.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
