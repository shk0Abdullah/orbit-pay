// import { Stack } from "expo-router";
// export default function RootLayout() {
//   return <Stack />;
// }
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot } from "expo-router";
import "../../global.css";

export default function RootLayout() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <Slot />;
  }
  return <Redirect href={"/(auth)/signin"} />;
}
