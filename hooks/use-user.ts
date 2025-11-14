// /hooks/useUser.ts
"use client";

import { useState, useEffect } from "react";

export function useUser(initialUser: any) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  return user;
}
