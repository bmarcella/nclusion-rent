import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'bankMenu.add',
        path: '/bank/add',
        component: lazy(() => import('@/views/bank/add')),
        authority: [],
    },
    {
        key: 'bankMenu.show',
        path: '/bank/show',
        component: lazy(() => import('@/views/bank/show')),
        authority: [],
    },
    {
        key: 'bankMenu.needApproval',
        path: '/bank/approval',
        component: lazy(() => import('@/views/bank/show/NeedApproval')),
        authority: ["coordonator", "assist_coordonator", "admin", "manager", "assist_manager", 'super_manager'],
    },
    {
        key: 'bankMenu.icurrent',
        path: '/bank/inactive',
        component: lazy(() => import('@/views/bank/show/InactiveBank')),
        authority: ["coordonator", "assist_coordonator", "admin", "manager", "assist_manager", 'super_manager'],
    },
    {
        key: 'bankMenu.approved',
        path: '/bank/BankByStep/:step',
        component: lazy(() => import('@/views/bank/show/pages/BankByStep')),
        authority: [],
    },
    {
        key: 'bankMenu.bankDetails',
        path: '/bank/:bankId',
        component: lazy(() => import('@/views/bank/show/BankDetails')),
        authority: [],
    },
    {
        key: 'bankMenu.vendor',
        path: '/bank/vendor',
        component: lazy(() => import('@/views/vendor')),
        authority: [],
    },
    {
        key: 'proprioMenu.add',
        path: '/proprio/add',
        component: lazy(() => import('@/views/proprio/add')),
        authority: [],
    },
    {
        key: 'proprioMenu.show',
        path: '/proprio/show',
        component: lazy(() => import('@/views/proprio/show')),
        authority: ["admin", 'super_manager'],
    },
    {
        key: 'proprioMenu.myEntity',
        path: '/proprio/myEntity',
        component: lazy(() => import('@/views/proprio/show/MyProprio')),
        authority: [],
    },
    {
        key: 'vendorMenu.contrat',
        path: '/contrat/:id',
        component: lazy(() => import('@/views/vendor/Contrat')),
        authority: [],
    },
    {
        key: 'vendorMenu.report',
        path: '/report',
        component: lazy(() => import('@/views/report')),
        authority: [],
    },

    ...othersRoute,
]
