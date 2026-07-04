"use client";

import { useEffect } from 'react';
import { client } from '@/client/client.gen';

export default function ClientAuth() {
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        client.setConfig({ auth: token });
      }
    } catch {
      // ignore
    }
  }, []);

  return null;
}
