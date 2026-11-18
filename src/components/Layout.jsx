import { useEffect } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import DemoPanel from "./DemoPanel.jsx";
import OrderBar from "./OrderBar.jsx";
import { useMeals } from "../context/MealsContext.jsx";
import { useOrder } from "../context/OrderContext.jsx";
import { buildLines, calculateTotals } from "../lib/pricing.js";

// Pages that already show the full cost summary do not need the running bar.
const NO_BAR = ["/order", "/checkout"];

// The frame around every page: header, main content (<Outlet />) and footer.
export default function Layout() {
  const { pathname } = useLocation();
  const { count, items, zoneId } = useOrder();
  const { status, meals } = useMeals();
  const showBar = count > 0 && status === "ready" && !NO_BAR.includes(pathname);
  const totals = showBar ? calculateTotals(buildLines(items, meals), zoneId) : null;

  // A new page should start at the top, and keyboard users should land on the content.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header__inner">
          <Logo />
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end className="nav__link nav__link--home">
              Home
            </NavLink>
            <NavLink to="/meals" className="nav__link">
              Meals
            </NavLink>
            <NavLink to="/orders" className="nav__link">
              Orders
            </NavLink>
            <NavLink to="/order" className="nav__link" aria-label={count > 0 ? `Basket, ${count} ${count === 1 ? "portion" : "portions"}` : "Basket"}>
              Basket
              {count > 0 && <span className="nav__count" aria-hidden="true">{count}</span>}
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className={showBar ? "site-footer site-footer--with-bar" : "site-footer"}>
        <div className="container">
          <p>
            HomePlate is a student project. The meals, cooks and orders are made up, and nothing is delivered or charged. <Link to="/credits">Photo credits</Link>
          </p>
          <DemoPanel />
        </div>
      </footer>

      {showBar && <OrderBar count={count} totals={totals} zoneId={zoneId} />}
    </>
  );
}
