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
        key: 'bankMenu.neeedApproval',
        path: '/bank/neeedApproval',
        component: lazy(() => import('@/views/bank/show/NeedApproval')),
        authority: [],
    },
    {
        key: 'bankMenu.bankDetails',
        path: '/bank/:bankId',
        component: lazy(() => import('@/views/bank/show/BankDetails')),
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
        authority: [],
    },

    ...othersRoute,
]
