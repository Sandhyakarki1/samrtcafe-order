export default function PaymentFailure() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-red-600">
          Payment Failed ❌
        </h1>
        <p className="mt-2 text-gray-600">
          Please try again or use another method.
        </p>
      </div>
    </div>
  );
}