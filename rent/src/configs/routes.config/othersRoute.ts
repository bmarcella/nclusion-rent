import { lazy } from 'react'
import { ADMIN } from '@/constants/roles.constant'
import type { Routes } from '@/@types/routes'

const othersRoute: Routes = [
    {
        key: 'accessDenied',
        path: `/access-denied`,
        component: lazy(() => import('@/views/others/AccessDenied')),
        authority: [ADMIN],
        meta: {
            pageBackgroundType: 'plain',
            pageContainerType: 'contained',
        },
    },
]

export default othersRoute
