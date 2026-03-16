import { Suspense, useEffect } from 'react'
import Loading from '@/components/shared/Loading'
import type { CommonProps } from '@/@types/common'
import { useAuth } from '@/auth'
import { useThemeStore } from '@/store/themeStore'
import PostLoginLayout from './PostLoginLayout'
import PreLoginLayout from './PreLoginLayout'
import { useLocation } from 'react-router-dom'
import { statsigClient } from '../../services/statsigClient'

const Layout = ({ children }: CommonProps) => {
    const layoutType = useThemeStore((state) => state.layout.type)
    const { authenticated } = useAuth();
    const location = useLocation();
    useEffect(() => {
        const fullURL = window.location.href
        if (window.location.hostname === 'localhost') {
            return
        }
        statsigClient()?.then((statsig) => {
            statsig?.logEvent('page_view', fullURL)
        })
    }, [location])

    return (
        <Suspense
            fallback={
                <div className="flex flex-auto flex-col h-[100vh]">
                    <Loading loading={true} />
                </div>
            }
        >
            {authenticated ? (
                <PostLoginLayout layoutType={layoutType}>
                    {children}
                </PostLoginLayout>
            ) : (
                <PreLoginLayout>{children}</PreLoginLayout>
            )}
        </Suspense>
    )
}

export default Layout
