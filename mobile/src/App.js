import { StatusBar } from "expo-status-bar";
import RootStackNavigation from "./navigations/RootStackNavigation";
import { createStaticNavigation } from "@react-navigation/native";
import { Provider } from "react-redux";
import store from "./redux/store";

const Navigation = createStaticNavigation(RootStackNavigation);
export default function App() {
  return (
    <Provider store={store}>
      <Navigation />
    </Provider>
  );
}
