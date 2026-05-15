export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-600">
          Payment Successful 🎉
        </h1>
        <p className="mt-2 text-gray-600">
          Your order has been placed successfully.
        </p>
      </div>
    </div>
  );
}