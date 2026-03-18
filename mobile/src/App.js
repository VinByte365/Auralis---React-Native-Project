import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import RootStackNavigation from "./navigations/RootStackNavigation";
import { NavigationContainer } from "@react-navigation/native";
import { Provider, useDispatch } from "react-redux";
import store from "./redux/store";
import { hydrateSession } from "./redux/thunks/authThunk";
import { hydrateCart } from "./redux/thunks/cartThunks";

function Bootstrapper() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(hydrateSession());
    dispatch(hydrateCart());
  }, [dispatch]);

  return (
    <NavigationContainer>
      <RootStackNavigation />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Bootstrapper />
    </Provider>
  );
}
