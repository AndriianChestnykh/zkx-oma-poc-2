'use client';

import { IntentValidationResult } from '@/lib/policy/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PolicyEvaluationResultProps {
  result: IntentValidationResult;
}

export function PolicyEvaluationResult({ result }: PolicyEvaluationResultProps) {
  return (
    <div className="space-y-4">
      {/* Overall Result */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Validation Result</h3>
            <Badge variant={result.passed ? 'success' : 'error'} size="lg">
              {result.passed ? 'PASSED' : 'FAILED'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Total Policies</p>
              <p className="text-xl font-semibold text-gray-900">{result.evaluations.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Passed</p>
              <p className="text-xl font-semibold text-green-600">
                {result.passedPolicies.length}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Failed</p>
              <p className="text-xl font-semibold text-red-600">
                {result.failedPolicies.length}
              </p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Evaluated at: {result.evaluatedAt.toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Individual Policy Results */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700">Policy Evaluations</h4>

        {result.evaluations.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 text-center py-4">
                No policies were evaluated
              </p>
            </CardContent>
          </Card>
        ) : (
          result.evaluations.map((evaluation, index) => (
            <Card
              key={`${evaluation.policyId}-${index}`}
              className={
                evaluation.passed
                  ? 'border-l-4 border-l-green-500'
                  : 'border-l-4 border-l-red-500'
              }
            >
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900">{evaluation.policyName}</h5>
                      <Badge variant={evaluation.passed ? 'success' : 'error'}>
                        {evaluation.passed ? 'Passed' : 'Failed'}
                      </Badge>
                      <Badge variant="default">{evaluation.policyType}</Badge>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">{evaluation.reason}</p>

                    {evaluation.metadata && Object.keys(evaluation.metadata).length > 0 && (
                      <details className="text-xs text-gray-600">
                        <summary className="cursor-pointer hover:text-gray-800">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-50 rounded overflow-x-auto">
                          {JSON.stringify(evaluation.metadata, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>

                  <div className="ml-4">
                    {evaluation.passed ? (
                      <svg
                        className="h-6 w-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-6 w-6 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
