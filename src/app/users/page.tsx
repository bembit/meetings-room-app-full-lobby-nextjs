'use client';

import { useState, useEffect } from "react";
import Nav from "@/components/Nav";
import Loading from "@/components/Loading";
import HoverCardDemo from "@/components/HoverCardDemo";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]); // Adjust the type as needed based on your User model
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError("Failed to fetch users.");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Nav />
      <h1 className="text-3xl font-bold mb-4">Registered Users</h1>
      <ul>
        {users.map((user) => (
          <HoverCardDemo key={user._id} email={user.email} />
          // <li key={user._id}>{user.email}</li>
        ))}
      </ul>
    </main>
  );
}