import { User } from './types';
import { API_URL } from './constants';

export const api = {
  // Fetch all users
  async getUsers(): Promise<User[]> {
    try {
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error('Failed to fetch');
      return await res.json();
    } catch (e) {
      console.warn("Backend not reachable, defaulting to empty list.", e);
      return [];
    }
  },

  // Create a new user
  async addUser(name: string, teamName: string, iconId: string): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, teamName, iconId })
      });
      if (!res.ok) throw new Error('Failed to create user');
      return await res.json();
    } catch (e) {
      console.error("API Error", e);
      return null;
    }
  },

  // Add steps to an existing user
  async addSteps(userId: string, steps: number): Promise<User | null> {
    try {
      const res = await fetch(`${API_URL}/users/${userId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps })
      });
      if (!res.ok) throw new Error('Failed to update steps');
      return await res.json();
    } catch (e) {
      console.error("API Error", e);
      return null;
    }
  },

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (e) {
      console.error("API Error", e);
      return false;
    }
  }
};