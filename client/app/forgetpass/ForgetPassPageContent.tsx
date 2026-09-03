"use client";
import { useSearchParams } from "next/navigation";
import RegistrationNumberInput from "./RegistrationNumberInput";
import OTPInput from "./OTPInput";

const ForgetPassPageContent = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const reg_no = searchParams.get("reg_no");

  if (tab === "otp" && reg_no) {
    return <OTPInput reg_no={reg_no} />;
  } else {
    return <RegistrationNumberInput />;
  }
};

export default ForgetPassPageContent;
