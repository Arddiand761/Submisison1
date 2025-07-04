import HomePage from "../pages/home/home-page";
import LoginPage from "../pages/login/login-page";
import DetailPage from "../pages/detail/detail-pages";
import NewPage from "../pages/new/new-page";
import RegisterPage from "../pages/register/register-page";
import BookmarkPage from "../pages/bookmark/bookmark";

const routes = {
  "/": new HomePage(),
  "/login": new LoginPage(),
  "/register": new RegisterPage(),
  "/detail/:id": new DetailPage(),
  "/new": new NewPage(),
  "/bookmark": new BookmarkPage(),
};

export default routes;
