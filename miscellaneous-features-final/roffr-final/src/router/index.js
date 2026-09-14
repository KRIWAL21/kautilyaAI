import { createRouter, createWebHistory } from 'vue-router'

// Layouts
import MainLayout from '@/layout/MainLayout.vue'

// Pages
import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/AboutView.vue'
import ProjectDetailView from '@/views/ProjectDetailView.vue'
import PropertyDetailView from '@/views/PropertyDetailView.vue'
import PropertyProjectView from '@/views/PropertyProjectView.vue'
import BlogDetails from '@/views/BlogDetails.vue'
import BlogsView from '@/views/BlogsView.vue'
import ResourceView from '@/views/ResourceView.vue'
import ContactusView from '@/views/ContactusView.vue'
import CaseStudyDetails from '@/views/CaseStudyDetails.vue'
import LoanView from '@/views/LoanView.vue'
import ChannelPartnerView from '@/views/ChannelPartnerView.vue'
import ArticlesView from '@/views/ArticlesView.vue'
import NewsView from '@/views/NewsView.vue'
import CaseStudyView from '@/views/CaseStudyView.vue'
import CorporateView from '@/views/CorporateView.vue'
import GroupBuyView from '@/views/GroupBuyView.vue'
import ProjectView2 from '@/views/ProjectView2.vue'
import PropertiesView2 from '@/views/PropertiesView2.vue'
import SearchView from '@/views/SearchView.vue'
import BrokerListView from '@/views/BrokerListView.vue'
import BrokerDetailsView from '@/views/BrokerDetailsView.vue'
import BuilderListView from '@/views/BuilderListView.vue'
import BuilderDetailsView from '@/views/BuilderDetailsView.vue'
import SocialView from '@/views/SocialView.vue'
import NewsDetails from '@/views/NewsDetails.vue'
import PlatformsView from '@/views/PlatformsView.vue'
import CitiesView from '@/views/CitiesView.vue'
import CityProjectsView from '@/views/CityProjectsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "",
      path: "/",
      component: MainLayout,
      children: [
        {
          name: "home",
          path: "/",
          component: HomeView
        },
        {
          name: "about",
          path: "/about",
          component: AboutView
        },
        {
          name: "project",
          path: "/project",
          component: ProjectView2,
          meta: { requiresAuth: true }
        },
        {
          name: "search",
          path: "/search",
          component: SearchView
        },
        {
          name: "properties",
          path: "/properties",
          component: PropertiesView2,
          meta: { requiresAuth: true }
        },
        {
          name: "contact",
          path: "/contact",
          component: ContactusView
        },
        {
          name: "broker-list",
          path: "/broker-list",
          component: BrokerListView
        },
        {
          name: "broker-details",
          path: "/broker-details/:id",
          component: BrokerDetailsView
        },
        {
          name: "channel-partners",
          path: "/channel-partners",
          component: BrokerListView,
          meta: { requiresAuth: true }
        },
        {
          name: "channel-partner-details",
          path: "/channel-partners/:id",
          component: BrokerDetailsView,
          meta: { requiresAuth: true }
        },
        {
          name: "builders",
          path: "/builders",
          component: BuilderListView,
          meta: { requiresAuth: true }
        },
        {
          name: "builder-details",
          path: "/builders/:id",
          component: BuilderDetailsView,
          meta: { requiresAuth: true }
        },
        {
          name: "social",
          path: "/social",
          component: SocialView
        },
        {
          name: "project-details",
          path: "/project-details/:id",
          component: ProjectDetailView,
          meta: { requiresAuth: true }
        },
        {
          name: "property-details",
          path: "/property-details/:id",
          component: PropertyDetailView,
          meta: { requiresAuth: true }
        },
        {
          name: "resources",
          path: "/resources",
          component: ResourceView
        },
        {
          name: "articles",
          path: "/articles",
          component: ArticlesView
        },
        {
          name: "news",
          path: "/news",
          component: NewsView
        },
        {
          name: "case-study",
          path: "/case-study",
          component: CaseStudyView
        },
        {
          name: "loan",
          path: "/loan",
          component: LoanView
        },
        {
          name: "corporate",
          path: "/corporate",
          component: CorporateView
        },
        {
          name: "group",
          path: "/group",
          component: GroupBuyView
        },
        {
          name: "my-group-buys",
          path: "/my-group-buys",
          component: () => import('@/views/MyGroupBuysView.vue')
        },
        {
          name: "channel-partner",
          path: "/channel-partner",
          component: ChannelPartnerView
        },
        {
          name: "blogs",
          path: "/blogs",
          component: BlogsView
        },
        {
          name: "blog-details",
          path: "/blog-details/:slug",
          component: BlogDetails
        },
        {
          name: "news-details",
          path: "/news/:id",
          component: NewsDetails
        },
        {
          name: "case-details",
          path: "/case-details/:id",
          component: CaseStudyDetails
        },
        {
          name: "dashboard",
          path: "/dashboard",
          component: () => import('@/views/DashboardView.vue')
        },
        {
          name: "platforms",
          path: "/platforms",
          component: PlatformsView
        },
        {
          name: "cities",
          path: "/cities",
          component: CitiesView
        },
        {
          name: "city-projects",
          path: "/cities/:city",
          component: CityProjectsView
        },
      ]
    },
    {
      name: "login",
      path: "/login",
      component: () => import('@/views/LoginView.vue')
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else if (to.hash) {
      return { el: to.hash };
    } else {
      return { top: 0 };
    }
  }
})

router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('accessToken')) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
