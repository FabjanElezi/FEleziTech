'use client';
import { useEffect } from 'react';

// Marks the document while an admin page is open so global decorative effects
// (edge glows, dot grid) can be switched off in CSS. Removed again on leave.
export default function AdminChrome() {
  useEffect(() => {
    document.documentElement.setAttribute('data-admin', '');
    return () => document.documentElement.removeAttribute('data-admin');
  }, []);
  return null;
}
