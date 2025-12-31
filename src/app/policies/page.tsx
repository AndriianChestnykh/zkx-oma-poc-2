import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function PoliciesPage() {
  // Mock data - will be replaced with actual API call in Step 3
  const policies = [
    {
      id: 1,
      name: "Sanctioned Addresses Blocklist",
      type: "allow_deny_list",
      enabled: true,
      priority: 5,
    },
    {
      id: 2,
      name: "Approved Venues Only",
      type: "venue_allowlist",
      enabled: true,
      priority: 10,
    },
    {
      id: 3,
      name: "Approved Assets Allowlist",
      type: "allow_deny_list",
      enabled: true,
      priority: 20,
    },
    {
      id: 4,
      name: "Daily Trade Limit - WETH",
      type: "trade_limit",
      enabled: true,
      priority: 30,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Policies</h1>
          <p className="mt-2 text-sm text-gray-600">
            Configure compliance policies and trading rules
          </p>
        </div>
        <Button disabled>Create Policy</Button>
      </div>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Active Policies</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {policy.name}
                    </h3>
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                    <span>Type: {policy.type}</span>
                    <span>Priority: {policy.priority}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" disabled>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" disabled>
                    Disable
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
                Policies are evaluated in priority order (lower = first). Policy
                management functionality will be implemented in Step 3.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
