import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="mt-4 text-xl text-gray-600">Access Denied</p>
        <p className="mt-2 text-gray-500">
          Only Admin users can access this application.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          If you believe this is an error, please contact your administrator.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Go to login
        </Link>
      </div>
    </div>
  );
}
