import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { MealsProvider } from "./context/MealsContext.jsx";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import { FiltersProvider } from "./context/FiltersContext.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import MealDetails from "./pages/MealDetails.jsx";
import NotFound from "./pages/NotFound.jsx";

// Shared state wraps the routes, so it survives moving between pages.
export default function App() {
  return (
    <MealsProvider>
      <PreferencesProvider>
        <FiltersProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="meals" element={<Browse />} />
              <Route path="meals/:id" element={<MealDetails />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </FiltersProvider>
      </PreferencesProvider>
    </MealsProvider>
  );
}
