import { SnackbarProvider } from "notistack";
import { Navigation } from "./router/Navigation";
import { ThemeWrapper } from "./theme";
import { useEffect } from "react";
import { useStore } from "./store";
import { setupAxiosInterceptors } from "./store/models/user";
import { axiosInstance } from "./api";

function App() {
  const initAuth = useStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
    setupAxiosInterceptors(axiosInstance);
  }, []);

  return (
    <div className="App">
      <ThemeWrapper>
        <SnackbarProvider>
          <Navigation />
        </SnackbarProvider>
      </ThemeWrapper>
    </div>
  );
}

export default App;
