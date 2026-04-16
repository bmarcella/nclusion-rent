import { Button, Dialog, Input } from '@/components/ui'
import {
    apiCreateOtpForRequest,
    apiVerifyOtpForRequest,
} from '@/services/OtpService'
import { useEffect, useRef, useState } from 'react'

interface Props {
    isOpen: boolean
    requestId: string
    onClose: () => void
    onVerified: () => void
}

const RESEND_COOLDOWN_S = 60

export default function OtpDialog({
    isOpen,
    requestId,
    onClose,
    onVerified,
}: Props) {
    const [code, setCode] = useState('')
    const [sending, setSending] = useState(false)
    const [verifying, setVerifying] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [info, setInfo] = useState<string | null>(null)
    const [cooldown, setCooldown] = useState(0)
    const sentForRef = useRef<string | null>(null)

    const sendOtp = async () => {
        setError(null)
        setInfo(null)
        setSending(true)
        try {
            const res = await apiCreateOtpForRequest(requestId)
            if (res.error) {
                setError(res.message || 'Failed to send code')
            } else {
                setInfo('Code envoyé. Vérifiez votre email.')
                setCooldown(RESEND_COOLDOWN_S)
            }
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                'Failed to send code'
            setError(msg)
        } finally {
            setSending(false)
        }
    }

    useEffect(() => {
        if (!isOpen) {
            setCode('')
            setError(null)
            setInfo(null)
            setCooldown(0)
            sentForRef.current = null
            return
        }
        if (sentForRef.current === requestId) return
        sentForRef.current = requestId
        sendOtp()
    }, [isOpen, requestId])

    useEffect(() => {
        if (cooldown <= 0) return
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
        return () => clearTimeout(t)
    }, [cooldown])

    const handleVerify = async () => {
        if (!code.trim()) {
            setError('Veuillez entrer le code')
            return
        }
        setError(null)
        setVerifying(true)
        try {
            const res = await apiVerifyOtpForRequest(requestId, code.trim())
            if (res.error) {
                setError(res.message || 'Code invalide')
                return
            }
            onVerified()
            onClose()
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                'Code invalide'
            setError(msg)
        } finally {
            setVerifying(false)
        }
    }

    return (
        <Dialog isOpen={isOpen} onClose={onClose} width={420}>
            <div className="p-6 space-y-4">
                <div>
                    <h5 className="text-lg font-semibold">
                        Confirmation par code
                    </h5>
                    <p className="text-sm text-gray-500 mt-1">
                        Un code de vérification a été envoyé à votre adresse
                        email. Entrez-le ci-dessous pour confirmer
                        l'approbation.
                    </p>
                </div>

                <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6 chiffres"
                    value={code}
                    onChange={(e) =>
                        setCode(e.target.value.replace(/\D/g, ''))
                    }
                    className="text-center tracking-[0.5em] text-lg"
                />

                {error && (
                    <div className="text-sm text-red-600">{error}</div>
                )}
                {info && !error && (
                    <div className="text-sm text-emerald-600">{info}</div>
                )}

                <div className="flex items-center justify-between gap-2">
                    <Button
                        variant="plain"
                        size="sm"
                        disabled={sending || cooldown > 0}
                        onClick={sendOtp}
                    >
                        {cooldown > 0
                            ? `Renvoyer (${cooldown}s)`
                            : sending
                              ? 'Envoi...'
                              : 'Renvoyer le code'}
                    </Button>
                    <div className="flex gap-2">
                        <Button
                            variant="plain"
                            size="sm"
                            onClick={onClose}
                            disabled={verifying}
                        >
                            Annuler
                        </Button>
                        <Button
                            variant="solid"
                            size="sm"
                            loading={verifying}
                            onClick={handleVerify}
                        >
                            Valider
                        </Button>
                    </div>
                </div>
            </div>
        </Dialog>
    )
}
