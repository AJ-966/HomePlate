import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { MealsProvider } from "./context/MealsContext.jsx";
import { PreferencesProvider } from "./context/PreferencesContext.jsx";
import { FiltersProvider } from "./context/FiltersContext.jsx";
import { OrderProvider } from "./context/OrderContext.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import MealDetails from "./pages/MealDetails.jsx";
import Order from "./pages/Order.jsx";
import Checkout from "./pages/Checkout.jsx";
import Orders from "./pages/Orders.jsx";
import OrderDetail from "./pages/OrderDetail.jsx";
import Credits from "./pages/Credits.jsx";
import NotFound from "./pages/NotFound.jsx";

// Shared state wraps the routes, so it survives moving between pages.
export default function App() {
  return (
    <MealsProvider>
      <PreferencesProvider>
        <FiltersProvider>
          <OrderProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="meals" element={<Browse />} />
              <Route path="meals/:id" element={<MealDetails />} />
              <Route path="order" element={<Order />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="orders" element={<Orders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="credits" element={<Credits />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </OrderProvider>
        </FiltersProvider>
      </PreferencesProvider>
    </MealsProvider>
  );
}
