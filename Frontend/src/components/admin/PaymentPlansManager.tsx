import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Toast } from '../ui/Toast';
import { Trash2, Edit, Plus } from 'lucide-react';

interface PaymentPlan {
  plan_id: number;
  name: string;
  fee_amount: number;
  duration: string;
}

export function PaymentPlansManager() {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ id: string; message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    fee_amount: '',
    duration: ''
  });

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

  const handleOpenModal = (plan?: PaymentPlan) => {
    if (plan) {
      setEditingId(plan.plan_id);
      setFormData({
        name: plan.name,
        fee_amount: plan.fee_amount.toString(),
        duration: plan.duration
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        fee_amount: '',
        duration: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.fee_amount || !formData.duration) {
      setToast({ id: 'error', message: 'Please fill all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `http://localhost:8000/payments/plans/${editingId}`
        : 'http://localhost:8000/payments/plans';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          fee_amount: parseFloat(formData.fee_amount),
          duration: formData.duration,
        }),
      });

      if (response.ok) {
        setToast({
          id: 'success',
          message: editingId ? 'Plan updated successfully!' : 'Plan created successfully!',
          type: 'success'
        });
        await fetchPlans();
        setShowModal(false);
      } else {
        setToast({ id: 'error', message: 'Failed to save plan', type: 'error' });
      }
    } catch (error) {
      setToast({ id: 'error', message: 'Network error', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/payments/plans/${planId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setToast({ id: 'success', message: 'Plan deleted successfully!', type: 'success' });
        await fetchPlans();
      } else {
        setToast({ id: 'error', message: 'Failed to delete plan', type: 'error' });
      }
    } catch (error) {
      setToast({ id: 'error', message: 'Network error', type: 'error' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment Plans</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <motion.div
            key={plan.plan_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Amount:</span> Rs. {plan.fee_amount}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Duration:</span> {plan.duration}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleOpenModal(plan)}
                variant="outline"
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(plan.plan_id)}
                variant="outline"
                className="flex-1 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Payment Plan' : 'Create Payment Plan'}
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Plan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Monthly Plan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Amount (Rs)
            </label>
            <Input
              type="number"
              value={formData.fee_amount}
              onChange={(e) => setFormData({ ...formData, fee_amount: e.target.value })}
              placeholder="5000"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <Input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., Monthly, Yearly"
            />
          </div>
        </div>
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