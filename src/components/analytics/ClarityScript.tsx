"use client";

import { useEffect } from "react";
import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = "v94d3dmcx5";

export default function ClarityScript() {
  useEffect(() => {
    Clarity.init(CLARITY_PROJECT_ID);
  }, []);
  return null;
}
