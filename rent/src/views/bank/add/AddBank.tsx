import { useState } from 'react'
import { BankFormVersion } from '@/views/Entity'
import BankForm from './components/BankForm'
import useTranslation from '@/utils/hooks/useTranslation'

export const AddBankBase = () => {
    const [version, setVersion] = useState<BankFormVersion | null>(null)
    const { t } = useTranslation()

    if (!version) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
                <h4 className="mb-8 text-gray-900 dark:text-gray-100">
                    {t('bank.selectVersion')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
                    <button
                        type="button"
                        onClick={() => setVersion(BankFormVersion.V1)}
                        className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                                V1
                            </span>
                        </div>
                        <div className="text-center">
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {t('bank.versionV1Title')}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('bank.versionV1Desc')}
                            </p>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setVersion(BankFormVersion.V2)}
                        className="flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary hover:shadow-lg transition-all cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-full bg-primary-subtle flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                                V2
                            </span>
                        </div>
                        <div className="text-center">
                            <h5 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                {t('bank.versionV2Title')}
                            </h5>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('bank.versionV2Desc')}
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        )
    }

    return <BankForm version={version} onBack={() => setVersion(null)} />
}

const AddBank = () => {
    return <AddBankBase />
}

export default AddBank