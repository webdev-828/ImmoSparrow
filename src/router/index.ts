import Vue from 'vue';
import Router from 'vue-router';
import store from '../store/index';
Vue.use(<any>Router);
import Dashboard from '../pages/dashboard/index';
import Search from '../pages/search/';
import Transparency from '../pages/transparency/';
import Login from '../pages/login/';
import Logout from '../components/logout';
import Users from '../pages/users/';
import Vendors from '../pages/vendors/';
import Mapp from '../pages/map/';
import MarketRadarAddress from '../pages/marketRadar/index';
import MyProfile from '../pages/myProfile/';
import AgencyProfile from '../pages/agencyProfile/';
import Inbox from '../pages/inbox/';
import Agencies from '../pages/agencies/';
import Employees from '../pages/employees/';
import Register from '../pages/register/';
import Signup from '../pages/signup/';
import Pipeline from '../pages/pipe/';
import Contacts from '../pages/contacts/';
import Activities from '../pages/activities/';
import PricePrediction from '../pages/pricePrediction/';
import Reminder from '../pages/reminder/';
import OverviewList from '../components/searchModule/overviewList';
import Portfolio from '../pages/portfolio';
import PerformancePage from '../pages/performance';
import MarketRadarOverall from '../pages/marketRadar/overall/';
import ApiUser from '../pages/apiUser';
import Surface from '../pages/surface';
import Teams from '../pages/teams';
import MSRegions from '../pages/msRegions';
import Monitoring from '../pages/monitoring';
import NotificationCenter from '../pages/notificationCenter';
import Subscription from '../pages/subscription';
import { getUserAgency, getUserContext, commitSetNoEmployeeStatus, getEmployeeContext } from '../store/modules/authStatesModule';
import { internal } from '@immosparrow/cockpit-api-v2/lib/public/internal';
import { EmployeeRole } from '@immosparrow/cockpit-api-v2';
import data = internal.data;

/*
* Preventing "NavigationDuplicated" errors in console in Vue-router >= 3.1.0
* https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378
* */

const routerMethods = ['push', 'replace'];

routerMethods.forEach((method: string) => {
  const originalCall = (Router.prototype as any)[method];
  (Router.prototype as any)[method] = function (location: any, onResolve: any, onReject: any): Promise<any> {
    if (onResolve || onReject) {
      return originalCall.call(this, location, onResolve, onReject);
    }
    return (originalCall.call(this, location) as any).catch((err: any) => err);
  };
});

const router = new Router({
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        plainLayout: true,
        requiresAuth: false,
      },
    },
    {
      path: '/register',
      name: 'Register',
      component: Register,
      meta: {
        plainLayout: true,
        requiresAuth: undefined,
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup,
      meta: {
        plainLayout: true,
        requiresAuth: false,
      },
      beforeEnter: (to: any, from: any, next: any) => {
        if (to.query.accessKey) {
          next();
        } else {
          next({ name: 'Login' });
        }
      },
    },
    {
      path: '/reminder',
      name: 'Reminder',
      component: Reminder,
      meta: {
        plainLayout: true,
        requiresAuth: false,
      },
    },
    {
      path: '/subscription',
      name: 'Subscription',
      component: Subscription,
      meta: {
        plainLayout: true,
        requiresAuth: false,
      },
    },
    {
      path: '/agencies',
      name: 'agencies',
      component: Agencies,
      meta: {
        isAdmin: true,
        requiresAuth: true,
      },
    },
    {
      path: '/users',
      name: 'users',
      component: Users,
      meta: {
        isAdmin: true,
        requiresAuth: true,
      },
    },
    {
      path: '/vendors',
      name: 'legalPersonMasters',
      component: Vendors,
      meta: {
        isAdmin: true,
        requiresAuth: true,
      },
    },

    {
      path: '/agencyProfile',
      name: 'profile',
      component: AgencyProfile,
      meta: {
        requiresAuth: true,
        isAgencyOwner: true,
        isAgencyAdmin: true,
      },
    },
    {
      path: '/employees',
      name: 'employees',
      component: Employees,
      meta: {
        requiresAuth: true,
        isAgencyAdmin: true,
        isAgencyOwner: true,
      },
    },

    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/logout',
      name: 'Logout',
      component: Logout,
      meta: {
        requiresAuth: true,
      },
      beforeEnter: (to: any, from: any, next: any) => {
        localStorage.setItem('fromRoute', from.name);
        next();
      },
    },
    {
      path: '/contacts',
      name: 'Contacts',
      component: Contacts,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/profile',
      name: 'Profile',
      component: MyProfile,
      meta: {
        requiresAuth: true,
        directLink: true,
      },
      children: [
        {
          path: ':tab',
          name: 'ProfileTab',
          component: MyProfile,
        },
      ],
    },
    {
      path: '/map',
      name: 'Map',
      component: Mapp,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/search',
      name: 'Search',
      component: Search,
      children: [
        {
          path: ':subId',
          name: 'SearchById',
          component: Search,
        },
      ],
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/publications/details',
      name: 'Details',
      component: OverviewList,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/transparency',
      name: 'Transparency',
      component: Transparency,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/market-radar-address/:id?',
      name: 'Market Radar Address',
      component: MarketRadarAddress,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/market-radar-overall',
      name: 'Market Radar Overall',
      component: MarketRadarOverall,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/inbox',
      name: 'Inbox',
      component: Inbox,
      children: [
        {
          path: ':subId',
          component: Inbox,
        },
      ],
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/pipe',
      name: 'Pipe',
      component: Pipeline,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/activities',
      name: 'Activities',
      component: Activities,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/price-prediction',
      name: 'Price Prediction',
      component: PricePrediction,
      meta: {
        requiresAuth: true,
        withEmployee: true,
      },
    },
    {
      path: '/surface',
      name: 'Surface',
      component: Surface,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/notificationCenter',
      name: 'NotificationCenter',
      component: NotificationCenter,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/portfolio',
      name: 'Portfolio',
      component: Portfolio,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/performance',
      name: 'Performance',
      component: PerformancePage,
      meta: {
        requiresAuth: true,
        isAgencyAdmin: true,
      },
    },
    {
      path: '/teams',
      name: 'Teams',
      component: Teams,
      meta: {
        requiresAuth: true,
        isAgencyAdmin: true,
      },
    },
    {
      path: '/ms-regions',
      name: 'MSRegions',
      component: MSRegions,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/api-user',
      name: 'ApiUser',
      component: ApiUser,
      meta: {
        requiresAuth: true,
      },
    },
    {
      path: '/monitoring',
      name: 'Monitoring',
      component: Monitoring,
      meta: {
        requiresAuth: true,
      },
    },
    { path: '*', redirect: '/' },
  ],
  base: '/',
  mode: 'history',
  linkActiveClass: 'active',
  // transitionOnLoad: true
});

router.beforeResolve((to, from, next) => {
  const apiSessionData = localStorage.getItem('api.auth.data');
  const context = getUserContext(store);

  // if for us doesn't matter user already login or not
  if (to.matched.some(record => record.meta.requiresAuth === undefined)) {
    return next();
  }

  if (!to.matched.some(record => record.meta.requiresAuth) && !!apiSessionData && (to.name === 'Login' && !to.query.resetId)) {
    next({ path: '/' });
  }

  if (to.matched.some(record => record.meta.isAdmin)) {
    if (context?.access?.globalPermissions[to.name]?.readList || context?.access?.globalPermissions[to.name]?.modify) {
      next();
    } else {
      next({ name: 'Dashboard' });
    }
  }

  if (to.matched.some(record => record.meta.isAgencyAdmin)) {
    const empCtx = getEmployeeContext(store);
    if (context?.access?.globalPermissions.agencies?.readList || empCtx.employee.role === EmployeeRole.Admin) {
      next();
    } else {
      next({ name: 'Dashboard' });
    }
  }

  if (to.matched.some(record => record.meta.isAgencyOwner)) {
    const userAgency = getUserAgency(store);
    if (userAgency.access[to.name].readList || userAgency.access[to.name].read) {
      next();
    } else {
      next({ name: 'Dashboard' });
    }
  }

  next();
});

router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.withEmployee)) {
    const getName = (name: string) => {
      switch (name) {
        case 'Search': return 'search';
        case 'Price Prediction': return 'pricePredictor';
        case 'Pipe' : return 'pipeline';
        case 'Activities': return 'pipeline';
        case 'Market Radar Address': return 'marketRadar';
        case 'Market Radar Overall': return 'marketRadar';
        default: return 'leads';
      }
    };

    const data = {
      pageName: to.name,
      moduleName: getName(to.name),
    };

    const employeeCtx = store.getters['authStatesModule/employeeContext'];

    commitSetNoEmployeeStatus(store, undefined);
    if (!employeeCtx || (employeeCtx && !employeeCtx.features[getName(to.name)].basic.isAvailable)) {
      if (store.getters['authStatesModule/loggedInUser']) {
        commitSetNoEmployeeStatus(store, data);
      }
      if (from.path === '/') {
        next({ path: '/', query: { redirect: to.fullPath } });
      } else {
        next(false);
      }
      return;
    }
  }
  next();
});

export default router;
