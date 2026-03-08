import { StatusBar } from "expo-status-bar";
import RootStackNavigation from "./navigations/RootStackNavigation";
import { createStaticNavigation } from "@react-navigation/native";

const Navigation = createStaticNavigation(RootStackNavigation);
export default function App() {
  return <Navigation />;
}

