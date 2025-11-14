export async function logoutUser() {
  await fetch("/api/auth/logout", {
    method: "POST",
  });

  // Optionally remove local user cache
  if (typeof window !== "undefined") {
    localStorage.removeItem("user");
  }

  // Redirect to login
  window.location.href = "/";
}
