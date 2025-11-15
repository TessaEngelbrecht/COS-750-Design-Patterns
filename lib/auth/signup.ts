export async function signupUser(formData: any) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(formData),
  });

  return res.json();
}
