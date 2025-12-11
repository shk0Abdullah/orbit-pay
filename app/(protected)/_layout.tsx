// import { Stack } from "expo-router";
// export default function RootLayout() {
//   return <Stack />;
// }
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Stack } from "expo-router";
import "../../global.css";

export default function RootLayout() {
  const { isSignedIn } = useAuth();
  if (!isSignedIn) {
    return <Stack />;
  }
  return <Redirect href={"/(auth)/signin"} />;
}
