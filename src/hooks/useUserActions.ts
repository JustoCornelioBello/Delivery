"use client";
import { useState } from "react";

export function useUserActions() {
  const [loading, setLoading] = useState(false);

  const deleteUser = async (userId: string) => {
    setLoading(true);
    try {
      // TODO: reemplaza por tu API real (DELETE /api/users/:id)
      await new Promise((r) => setTimeout(r, 800));
      return { success: true, message: "User deleted successfully" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Error deleting user" };
    } finally {
      setLoading(false);
    }
  };

  const resetUser = async (userId: string) => {
    setLoading(true);
    try {
      // TODO: reemplaza por tu API real (POST /api/users/:id/reset)
      await new Promise((r) => setTimeout(r, 800));
      return { success: true, message: "User reset successfully" };
    } catch (e) {
      console.error(e);
      return { success: false, message: "Error resetting user" };
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, resetUser, loading };
}
