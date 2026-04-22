import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Toast } from '../ui/Toast';
import { CreditCard } from 'lucide-react';

interface PaymentPlan {
  plan_id: number;
  name: string;
  fee_amount: number;
  duration: string;
}

export function PaymentForm() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'error' } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholder, setCardholder] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:8000/payments/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    }
  };

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPlan(parseInt(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlan === null || paymentMethod === '') {
      setToast({ id: 'payment-error', message: 'Please select a plan and payment method', type: 'error' });
      return;
    }
    setShowModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!cardNumber || !expiry || !cvv || !cardholder) {
      setToast({ id: 'payment-error', message: 'Please fill all card details', type: 'error' });
      return;
    }

    setLoading(true);
    const selectedPlanData = plans.find(p => p.plan_id === selectedPlan);
    if (!selectedPlanData) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/payments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan_id: selectedPlan,
          amount: selectedPlanData.fee_amount,
          payment_method: paymentMethod,
        }),
      });

      if (response.ok) {
        setToast({ id: 'payment-success', message: 'Payment completed successfully!', type: 'success' });
        // Reset form
        setSelectedPlan(null);
        setPaymentMethod('');
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setCardholder('');
        setShowModal(false);
      } else {
        const error = await response.json();
        setToast({ id: 'payment-error', message: error.detail || 'Payment failed', type: 'error' });
      }
    } catch (error) {
      setToast({ id: 'payment-error', message: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <CreditCard className="h-6 w-6 text-primary-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Make a Payment</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Plan
            </label>
            <Select
              value={selectedPlan?.toString() || ''}
              onChange={handlePlanChange}
             options={[
  { value: '', label: 'Select a plan' },
  ...plans.map(plan => ({
    value: plan.plan_id.toString(),
    label: `${plan.name} - Rs. ${plan.fee_amount}`
  }))
]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <Select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              options={[
  { value: '', label: 'Select payment method' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
]}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </form>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Payment Details"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment} disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Payment'}
            </Button>
          </div>
        }
      >
        {selectedPlan && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Summary</h3>
              <div className="space-y-1">
                <p><span className="font-medium">Plan:</span> {plans.find(p => p.plan_id === selectedPlan)?.name}</p>
                <p><span className="font-medium">Amount:</span> Rs{plans.find(p => p.plan_id === selectedPlan)?.fee_amount}</p>
                <p><span className="font-medium">Method:</span> {paymentMethod}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <Input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <Input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <Input
                  type="text"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cardholder Name
                </label>
                <Input
                  type="text"
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <Toast
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </motion.div>
  );
}