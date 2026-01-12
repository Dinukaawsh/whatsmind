import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logout successful",
    note: "You have been logged out from this application. If you are logged into CRM, you can access this app again by refreshing the page.",
  });

  // Delete only this app's token (CRM token remains if user is still logged into CRM)
  response.cookies.delete("token");

  return response;
}
