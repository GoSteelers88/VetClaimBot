'use client';

import { MemberRegistration } from '@/components/registration/MemberRegistration';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function IntakeWizardPage() {
  return (
    <ProtectedRoute>
      <MemberRegistration />
    </ProtectedRoute>
  );
}