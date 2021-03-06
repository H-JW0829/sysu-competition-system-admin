import Login from '../pages/Login';
import Home from '../pages/Home';
import Users from '../pages/Users';
import Competition from '../components/competition';
import NotFound from '../pages/NotFound';
import Register from '../pages/Register';

let routes = [
  {
    path: '/',
    component: Login,
    exact: true,
  },
  {
    path: '/login',
    component: Login,
    exact: true,
  },
  {
    path: '/register',
    component: Register,
    exact: true,
  },
  {
    path: '/home',
    component: Home,
    // exact: true,
    routes: [
      {
        path: '/users',
        component: Users,
        exact: true,
      },
      {
        path: '/competitions',
        component: Competition,
        exact: true,
      },
    ],
  },
  {
    path: '*',
    component: NotFound,
  },
];

export default routes;
