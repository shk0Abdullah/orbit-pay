import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot } from "expo-router";
import "../../global.css";

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href={"/(protected)"} />;
  }
  return <Slot />;
}
