import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import { MailProvider } from './provider/MailProvider'

if (appConfig.enableMock) {
    import('./mock')
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <MailProvider>
                        <Layout>
                            <Views />
                        </Layout>
                    </MailProvider>
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App
