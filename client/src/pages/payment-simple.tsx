import { useAuth } from "@/hooks/useAuth";

export default function PaymentSimple() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Payment Page Test</h1>
      <p>This is a simple test payment page.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h3 className="font-bold">Auth Debug:</h3>
        <p>Loading: {isLoading ? 'true' : 'false'}</p>
        <p>Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
        <p>User: {user ? JSON.stringify(user) : 'null'}</p>
      </div>
    </div>
  );
}