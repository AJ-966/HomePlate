import { useEffect } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Logo from "./Logo.jsx";
import { useOrder } from "../context/OrderContext.jsx";

// The frame around every page: header, main content (<Outlet />) and footer.
export default function Layout() {
  const { pathname } = useLocation();
  const { count } = useOrder();

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
            <NavLink to="/" end className="nav__link">
              Home
            </NavLink>
            <NavLink to="/meals" className="nav__link">
              Meals
            </NavLink>
            <NavLink to="/order" className="nav__link" aria-label={count > 0 ? `Your order, ${count} ${count === 1 ? "meal" : "meals"}` : "Your order"}>
              Your order
              {count > 0 && <span className="nav__count" aria-hidden="true">{count}</span>}
            </NavLink>
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            HomePlate is a student project. The meals, cooks and orders are made up, and nothing is delivered or charged.
          </p>
        </div>
      </footer>
    </>
  );
}
