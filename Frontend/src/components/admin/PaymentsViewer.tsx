import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { CreditCard, Calendar, Users } from 'lucide-react';

interface Payment {
  payment_id: number;
  parent_id: number;
  plan_id: number;
  amount: number;
  payment_method: string;
  payment_date: string;
  parent_name?: string;
  plan_name?: string;
}

export function PaymentsViewer() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/payments/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading payments...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">All Payments</h2>

      {payments.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No payments found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment, index) => (
            <motion.div
              key={payment.payment_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    <Users className="h-4 w-4 inline mr-2" />
                    Parent
                  </p>
                  <p className="font-semibold text-gray-900">{payment.parent_name || `Parent #${payment.parent_id}`}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Plan
                  </p>
                  <p className="font-semibold text-gray-900">{payment.plan_name || `Plan #${payment.plan_id}`}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    <CreditCard className="h-4 w-4 inline mr-2" />
                    Amount
                  </p>
                  <p className="font-semibold text-primary-600">Rs. {payment.amount.toFixed(2)}</p>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="text-sm font-medium text-gray-900">{payment.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Date
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}