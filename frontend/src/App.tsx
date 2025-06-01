import { Navigation } from "./router/Navigation";
import { ThemeWrapper } from "./theme";

function App() {
  return (
    <div className="App">
      <ThemeWrapper>
        <Navigation />
      </ThemeWrapper>
    </div>
  );
}

export default App;
