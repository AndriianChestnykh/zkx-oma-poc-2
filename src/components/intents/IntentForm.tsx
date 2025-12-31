/**
 * Intent creation form
 */
'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

interface FormData {
  user_address: string;
  asset_in: string;
  asset_out: string;
  amount_in: string;
  amount_out_min: string;
  venue: string;
  deadline: string; // Hours from now
  nonce: string;
}

const initialFormData: FormData = {
  user_address: '',
  asset_in: '',
  asset_out: '',
  amount_in: '',
  amount_out_min: '',
  venue: 'uniswap-v3',
  deadline: '24',
  nonce: '0',
};

export function IntentForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // User address
    if (!formData.user_address) {
      newErrors.user_address = 'User address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.user_address)) {
      newErrors.user_address = 'Invalid Ethereum address';
    }

    // Asset in
    if (!formData.asset_in) {
      newErrors.asset_in = 'Asset in is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.asset_in)) {
      newErrors.asset_in = 'Invalid Ethereum address';
    }

    // Asset out
    if (!formData.asset_out) {
      newErrors.asset_out = 'Asset out is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.asset_out)) {
      newErrors.asset_out = 'Invalid Ethereum address';
    }

    // Amount in
    if (!formData.amount_in) {
      newErrors.amount_in = 'Amount in is required';
    } else if (!/^\d+$/.test(formData.amount_in)) {
      newErrors.amount_in = 'Amount must be a positive integer (in wei)';
    }

    // Amount out min
    if (!formData.amount_out_min) {
      newErrors.amount_out_min = 'Minimum amount out is required';
    } else if (!/^\d+$/.test(formData.amount_out_min)) {
      newErrors.amount_out_min = 'Amount must be a positive integer (in wei)';
    }

    // Venue
    if (!formData.venue) {
      newErrors.venue = 'Venue is required';
    }

    // Deadline
    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (isNaN(parseInt(formData.deadline)) || parseInt(formData.deadline) <= 0) {
      newErrors.deadline = 'Deadline must be a positive number';
    }

    // Nonce
    if (formData.nonce === '') {
      newErrors.nonce = 'Nonce is required';
    } else if (!/^\d+$/.test(formData.nonce) || parseInt(formData.nonce) < 0) {
      newErrors.nonce = 'Nonce must be a non-negative integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      // Calculate deadline as Unix timestamp
      const deadlineHours = parseInt(formData.deadline);
      const deadlineTimestamp = Math.floor(Date.now() / 1000) + deadlineHours * 3600;

      const payload = {
        user_address: formData.user_address,
        asset_in: formData.asset_in,
        asset_out: formData.asset_out,
        amount_in: formData.amount_in,
        amount_out_min: formData.amount_out_min,
        venue: formData.venue,
        deadline: deadlineTimestamp,
        nonce: parseInt(formData.nonce),
      };

      const response = await fetch('/api/intents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          // Zod validation errors
          const fieldErrors: Record<string, string> = {};
          data.details.forEach((err: any) => {
            if (err.path && err.path.length > 0) {
              fieldErrors[err.path[0]] = err.message;
            }
          });
          setErrors(fieldErrors);
        } else {
          setServerError(data.error || 'Failed to create intent');
        }
        return;
      }

      // Success - redirect to intent detail page
      router.push(`/intents/${data.data.id}`);
    } catch (error: any) {
      setServerError(error.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="bordered">
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900">Create New Intent</h2>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details below to create a trade intent
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {serverError}
            </div>
          )}

          <Input
            label="User Address"
            name="user_address"
            type="text"
            value={formData.user_address}
            onChange={handleChange}
            error={errors.user_address}
            helperText="Ethereum address of the user creating this intent"
            placeholder="0x..."
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Asset In (Address)"
              name="asset_in"
              type="text"
              value={formData.asset_in}
              onChange={handleChange}
              error={errors.asset_in}
              helperText="Token you want to swap from"
              placeholder="0x..."
              required
            />

            <Input
              label="Asset Out (Address)"
              name="asset_out"
              type="text"
              value={formData.asset_out}
              onChange={handleChange}
              error={errors.asset_out}
              helperText="Token you want to receive"
              placeholder="0x..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Amount In (Wei)"
              name="amount_in"
              type="text"
              value={formData.amount_in}
              onChange={handleChange}
              error={errors.amount_in}
              helperText="Amount to swap (in wei, e.g., 1000000000000000000 = 1 ETH)"
              placeholder="1000000000000000000"
              required
            />

            <Input
              label="Min Amount Out (Wei)"
              name="amount_out_min"
              type="text"
              value={formData.amount_out_min}
              onChange={handleChange}
              error={errors.amount_out_min}
              helperText="Minimum acceptable amount out (in wei)"
              placeholder="900000000000000000"
              required
            />
          </div>

          <Select
            label="Venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            error={errors.venue}
            helperText="Trading venue to execute on"
            options={[
              { value: 'uniswap-v3', label: 'Uniswap V3' },
              { value: 'curve', label: 'Curve' },
              { value: 'balancer', label: 'Balancer' },
            ]}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Deadline (Hours)"
              name="deadline"
              type="number"
              value={formData.deadline}
              onChange={handleChange}
              error={errors.deadline}
              helperText="Hours from now until intent expires"
              placeholder="24"
              required
            />

            <Input
              label="Nonce"
              name="nonce"
              type="number"
              value={formData.nonce}
              onChange={handleChange}
              error={errors.nonce}
              helperText="Unique number for replay protection (increment for each intent)"
              placeholder="0"
              required
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Intent'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
