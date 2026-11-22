// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const useLeaveNotifications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  return useCallback(() => {
    if (location.key === "default") {
      navigate("/", { replace: true });
      return;
    }
    navigate(-1);
  }, [location.key, navigate]);
};
