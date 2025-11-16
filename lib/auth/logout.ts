export async function logoutUser() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  // Redirect to login
  window.location.href = "/";
}
