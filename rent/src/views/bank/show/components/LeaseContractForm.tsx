import { Bank, Proprio } from '@/views/Entity'
import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import { getLandlordById } from '@/services/firebase/LandlordService'
import { getRegionsById, RegionType } from '@/views/Entity/Regions'
import n2words from 'n2words'
import useTranslation from '@/utils/hooks/useTranslation'
import FrenchDate from './FrenchDate '

type ContractVersion = 'v1' | 'v2'

interface Props {
    bank: Bank
    pdf?: boolean
    version?: ContractVersion
    headerSize?: number
    descSize?: number
}

interface InlineFieldProps {
    children?: ReactNode
    className?: string
}

const InlineField = ({ children, className = '' }: InlineFieldProps) => (
    <span
        className={`inline-block border-b border-gray-400 px-1 ${className}`.trim()}
    >
        {children}
    </span>
)

const SectionTitle = ({ children }: { children: ReactNode }) => (
    <h2
        className="font-semibold mt-6 mb-3"
        style={{ fontSize: 'var(--contract-header-size, 1.25rem)' }}
    >
        {children}
    </h2>
)

const WarningText = ({ children }: { children: ReactNode }) => (
    <p className="text-red-400 text-lg mt-3">{children}</p>
)

const LeaseContractForm = ({
    bank,
    version = 'v2',
    headerSize = 14.7,
    descSize = 13.5,
}: Props) => {
    const [landlord, setLandlord] = useState<Proprio | null>(null)
    const [landlordRegion, setLandlordRegion] = useState<RegionType | null>(null)
    const [bankRegion, setBankRegion] = useState<RegionType | null>(null)

    const { t } = useTranslation()

    useEffect(() => {
        let mounted = true

        const loadData = async () => {
            try {
                const ll = (await getLandlordById(bank.landlord)) as Proprio
                if (!mounted) return

                setLandlord(ll)

                if (ll?.regions?.[0]) {
                    setLandlordRegion(getRegionsById(ll.regions[0]))
                } else {
                    setLandlordRegion(null)
                }

                if (bank?.id_region) {
                    setBankRegion(getRegionsById(Number(bank.id_region)))
                } else {
                    setBankRegion(null)
                }
            } catch (error) {
                console.error('Error loading lease contract data:', error)
            }
        }

        loadData()

        return () => {
            mounted = false
        }
    }, [bank])

    const rentAmount = Number(bank?.final_rentCost || 0)

    const rentAmountFormatted = useMemo(() => {
        return new Intl.NumberFormat('fr-FR').format(rentAmount)
    }, [rentAmount])

    const rentAmountInWords = useMemo(() => {
        try {
            return n2words(rentAmount, { lang: 'fr' })
        } catch {
            return ''
        }
    }, [rentAmount])

    const roofLabel = useMemo(() => {
        return bank.securityDetails?.roof
            ? t('bank.' + bank.securityDetails.roof)
            : bank.v2RoofType
              ? t('bank.' + bank.v2RoofType)
              : 'Tôle ou béton'
    }, [bank.securityDetails?.roof, bank.v2RoofType, t])

    const landlordIdentity = useMemo(() => {
        return [
            landlord?.cin ? `NIN : ${landlord.cin}` : null,
            landlord?.nif ? `NIF : ${landlord.nif}` : null,
        ]
            .filter(Boolean)
            .join(', ')
    }, [landlord])

    const renderContractV1 = () => {
        if (!landlord) return null

        return (
            <div className="p-6 bg-white rounded-lg text-gray-800 leading-relaxed text-lg">
                <h1 className="text-2xl font-bold text-center mb-6">
                    CONTRAT DE BAIL
                </h1>

                <p className="mb-4 font-semibold text-xl">ENTRE :</p>
                <div className="mb-6 text-lg">
                    <p>
                        <InlineField className="pt-4 mr-2">
                            {landlord.fullName}
                        </InlineField>{' '}
                        demeurant et domicilié à :
                        <InlineField className="w-auto mr-2">
                            {landlord.address}, {landlord.city},{' '}
                            {landlordRegion?.capital}
                        </InlineField>
                        ,
                        <InlineField className="w-auto mr-2">
                            Tel : {landlord.phone}{' '}
                            {landlord.phone_b ? `/ ${landlord.phone_b}` : null}.
                        </InlineField>
                        identifié au No.
                        {landlord.cin && (
                            <InlineField className="w-auto mr-2">
                                NIN : {landlord.cin},
                            </InlineField>
                        )}
                        {landlord.nif && (
                            <InlineField className="w-auto mr-2">
                                NIF : {landlord.nif}
                            </InlineField>
                        )}
                    </p>
                    <p className="mt-1">
                        Agissant en qualité de copropriétaire, ci-après dénommé{' '}
                        <strong>le « Bailleur »</strong>, d’une part ;
                    </p>
                </div>

                <p className="mb-4 font-semibold text-xl">ET</p>
                <div className="mb-6 text-lg">
                    <p>
                        <strong>NYLC S.A.</strong>, société anonyme constituée en
                        vertu des lois haïtiennes, ayant son siège social au #11,
                        rue Ogé, Pétion-Ville, Delmas, Haiti. Représentée par
                        Monsieur/Madame
                        <InlineField className="w-auto ml-2">
                            {/* Representative name */}
                        </InlineField>
                        <InlineField className="w-100 mx-2" />
                        en qualité de coordonnateur/superviseur, ci-après
                        dénommée la <strong>« Preneuse »</strong>, d’autre part.
                    </p>
                </div>

                <SectionTitle>Article 1 - Objet</SectionTitle>

                <p className="text-lg">
                    Le Bailleur donne en bail un espace situé au :
                    <InlineField className="w-auto ml-2 mr-2">
                        {bank.addresse}, {bank.city}, {bankRegion?.label}
                    </InlineField>
                    . Recouvert en{' '}
                    <InlineField className="w-auto ml-2 mr-2">
                        {roofLabel}
                    </InlineField>
                    , d’une superficie :{' '}
                    <InlineField className="w-auto ml-2">
                        {bank.superficie}
                    </InlineField>{' '}
                    m², comprenant{' '}
                    <InlineField className="w-auto ml-2 mr-2">
                        {bank.nombre_chambre}
                    </InlineField>{' '}
                    pièces/chambres.
                </p>

                <p className="mt-2 text-lg">
                    Utilités : toilette (oui/non), accès à l’eau (oui/non),
                    électricité (oui/non).
                </p>

                <p className="mt-2 text-lg">
                    Destination : à des fins commerciales.
                </p>

                <SectionTitle>Article 2 - Durée</SectionTitle>

                <p className="text-lg">
                    Durée :
                    <InlineField className="w-auto ml-2 mr-2">
                        {bank.yearCount}
                    </InlineField>{' '}
                    année(s), du
                    <InlineField className="w-auto ml-2 mr-r">
                        <FrenchDate dateString={bank.date} />
                    </InlineField>{' '}
                    au
                    <InlineField className="w-auto ml-2 mr-r">
                        <FrenchDate dateString={bank.date} y={bank.yearCount} />
                    </InlineField>
                    .
                </p>

                <p className="mt-2 text-lg">
                    Renouvelable par tacite reconduction pour une année selon les
                    mêmes termes.
                </p>

                <SectionTitle>Article 3 - Loyer</SectionTitle>

                <p className="text-lg">
                    Montant :
                    <InlineField className="w-auto ml-2">
                        HTG {rentAmountFormatted}
                    </InlineField>{' '}
                    (
                    <InlineField className="w-auto uppercase mx-2">
                        {rentAmountInWords}
                    </InlineField>
                    ) payable à la date d’entrée dans les lieux.
                </p>

                {rentAmount === 0 && (
                    <WarningText>
                        Le montant du loyer est égal à 0, vous devez aller le
                        modifier dans la section Banks Actives → Contrat
                    </WarningText>
                )}

                <div className="mt-6 text-lg">
                    <p>
                        Fait au <InlineField className="w-48 mx-2" />, de bonne
                        foi, et en double original, le
                        <InlineField className="w-48 mx-2" />.
                    </p>
                </div>

                <div className="mt-12 flex justify-between text-lg">
                    <div>
                        <p className="mb-1">____________________________</p>
                        <p className="text-base">Pour le Bailleur</p>
                    </div>
                    <div>
                        <p className="mb-1">____________________________</p>
                        <p className="text-base">Pour la Preneuse</p>
                    </div>
                </div>

                <div className="mt-8 text-lg">
                    <p>__________________________________</p>
                    <p className="text-base">Témoin(s)</p>
                </div>

                <h3 className="text-xl font-semibold mt-8">
                    Consentement additionnel :
                </h3>
                <div className="h-12 border border-gray-300 rounded mt-2" />
            </div>
        )
    }

    const renderContractV2 = () => {
        if (!landlord) return null

        return (
            <div className="p-6 bg-white rounded-lg text-gray-800 leading-relaxed text-lg">
                <h1 className="text-2xl font-bold text-center mb-8">
                    CONTRAT DE BAIL A LOYER
                </h1>

                <p className="mb-6 font-semibold">ENTRE LES SOUSSIGNÉS :</p>

                <div className="mb-8">
                    <p>
                        <InlineField>{landlord.fullName}</InlineField>{' '}
                        propriétaire, demeurant et domicilié à{' '}
                        <InlineField>
                            {landlord.address}, {landlord.city}
                            {landlordRegion?.capital
                                ? `, ${landlordRegion.capital}`
                                : ''}
                        </InlineField>
                        , identifié au No{' '}
                        <InlineField>
                            {landlordIdentity || '_______________________'}
                        </InlineField>
                        ,
                    </p>
                    <p className="mt-2">
                        Ci-après le <strong>BAILLEUR</strong>, d'une part.
                    </p>
                </div>

                <div className="mb-8">
                    <p className="font-semibold mb-2">ET :</p>
                    <p>
                        <strong>NYLC S.A.</strong>, société anonyme constituée en
                        vertu des lois haïtiennes, ayant son siège social au #20,
                        rue Faustin 1er, Delmas 75, Delmas, Republic of Haiti.,
                        imposée et patentée respectivement aux Nos. 000-099-239-4;
                        2607164625, représentée aux fins des présentes par
                        Monsieur <InlineField className="min-w-[400px]" /> en sa
                        qualité de{' '}
                        <InlineField className="min-w-[260px]">
                            Coordonnateur des Opérations
                        </InlineField>
                        ,
                    </p>
                    <p className="mt-2">
                        Ci-après dénommé le <strong>PRENEUR</strong>, d'autre
                        part.
                    </p>
                </div>

                <p className="mb-6 font-semibold">
                    IL A ETE CONVENU ET ARRETE CE QUI SUIT :
                </p>

                <SectionTitle>
                    ARTICLE 1 : OBJET - DESIGNATION - DESCRIPTION DES LIEUX
                </SectionTitle>

                <p>
                    Le Bailleur donne à bail à loyer au Preneur qui l'accepte,
                    un appartement, sis à{' '}
                    <InlineField>
                        {bank.addresse}, {bank.city}
                        {bankRegion?.label ? `, ${bankRegion.label}` : ''}
                    </InlineField>
                    , d’une superficie d’environ{' '}
                    <InlineField>
                        {bank.superficie || '__________'}
                    </InlineField>{' '}
                    mètres carrés composé de :
                </p>

                <div className="mt-3 ml-6">
                    <p>• {bank.nombre_chambre || '__________'} pièce(s) / chambre(s)</p>
                    <p>• Toiture : {roofLabel}</p>
                    <p>• Usage commercial</p>
                    <p>• Utilités : toilette / eau / électricité</p>
                </div>

                <p className="mt-4">
                    Le Preneur déclare connaître les lieux pour les avoirs
                    visités et qu'ils sont à son entière convenance et
                    satisfaction.
                </p>

                <SectionTitle>
                    ARTICLE 2 : DUREE ET RENOUVELLEMENT
                </SectionTitle>

                <p>
                    Le présent bail est conclu pour une durée de{' '}
                    <InlineField>
                        {bank.yearCount || '__________'}
                    </InlineField>{` `} { Number(bank.yearCount) > 1 ? 'ans' : 'an'} ,
                    commençant à courir le{' '}
                    <InlineField>
                        <FrenchDate dateString={bank.date} />
                    </InlineField>{' '}
                    pour le prendre fin le{' '}
                    <InlineField>
                        <FrenchDate dateString={bank.date} y={bank.yearCount} />
                    </InlineField>
                    .
                </p>

                <p className="mt-3">
                    Il est renouvelable par tacite reconduction. Toute partie qui
                    n'entendra pas renouveler ou renégocier le présent bail en
                    avisera l'autre, par lettre avec accusé de réception, trois
                    (3) mois au moins avant l'échéance prévue.
                </p>

                <SectionTitle>ARTICLE 3 : PRIX - PAIEMENT LOYER</SectionTitle>

                <p>
                    Le Preneur s'engage à payer au Bailleur un loyer annuel de{' '}
                    <InlineField>{rentAmountFormatted}</InlineField> Gourdes
                    (GDES{' '}
                    <InlineField className="uppercase">
                        {rentAmountInWords}
                    </InlineField>
                    ) pendant la durée du bail.
                </p>

                <p className="mt-3">
                    Les loyers sont dus au début de chaque période annuelle,
                    entre le <InlineField className="min-w-[140px]" /> et{' '}
                    <InlineField className="min-w-[140px]" /> du premier mois de
                    la nouvelle année de bail.
                </p>

                <p className="mt-3">
                    Le paiement des loyers se fera par Cash ou par chèque à
                    l’ordre du Bailleur ou par virement bancaire.
                </p>

                {rentAmount === 0 && (
                    <WarningText>
                        Le montant du loyer est égal à 0, vous devez aller le
                        modifier dans la section Banks Actives → Contrat
                    </WarningText>
                )}

                <SectionTitle>
                    ARTICLE 4 : JOUISSANCE DES LIEUX - GARANTIE D'EVICTION
                </SectionTitle>

                <p>
                    Le Bailleur, dès la signature des présentes, remettra toutes
                    les clefs de l'immeuble loué au Preneur.
                </p>
                <p className="mt-3">
                    Il garantira le Preneur contre tout trouble de jouissance ou
                    d'éviction des lieux loués causé par son fait ou autrement.
                </p>

                <SectionTitle>ARTICLE 5 : ENTRETIEN - REPARATION</SectionTitle>

                <p>
                    Pendant toute la durée du bail, le Preneur jouira des lieux
                    loués en bon père de famille et les maintiendra, en parfait
                    état de conservation et de réparation locative, sous réserve
                    de l'usure naturelle.
                </p>
                <p className="mt-3">
                    Il veillera aussi, notamment, au bon fonctionnement de
                    toutes les installations sanitaires (toilettes),
                    électriques, dont l'entretien et les réparations leur
                    incombent, sous réserve des grosses réparations.
                </p>

                <SectionTitle>
                    ARTICLE 6 : INSTALLATIONS - AMENAGEMENTS - CONSTRUCTION
                </SectionTitle>

                <p>
                    Le Preneur aura le droit d'entreprendre dans les lieux
                    loués, tous travaux nécessaires (améliorations,
                    aménagements, constructions) pour leurs besoins sauf à le
                    notifier au Bailleur, par lettre avec accusé de réception.
                </p>
                <p className="mt-3">
                    Les aménagements, constructions, notamment, effectués aux
                    frais du Preneur, devront respecter la structure et la
                    solidité de l'immeuble qui ne devront pas en être affectées.
                </p>

                <SectionTitle>ARTICLE 7 : DESTINATION DES LIEUX</SectionTitle>

                <p>
                    Les lieux présentement donnés à bail sont exclusivement
                    destinés à héberger l’entreprise commerciale du Preneur ; le
                    Preneur ne pourra modifier cette destination sans une
                    autorisation écrite préalable du Bailleur.
                </p>

                <SectionTitle>
                    ARTICLE 8 : IMPOTS ET CHARGES LOCATIVES
                </SectionTitle>

                <p>
                    <strong>8.1.</strong> Le Bailleur acquittera tous les impôts,
                    contributions et taxes lui incombant ou dont elle pourrait
                    être responsable.
                </p>
                <p className="mt-3">
                    En outre, conformément aux dispositions légales
                    applicables, le Preneur effectuera une retenue à la source
                    de l’équivalent de 10% des loyers et les versera au fisc
                    pour le compte du Bailleur à d’acompte sur l’impôt sur les
                    revenus fonciers due par le Bailleur.
                </p>
                <p className="mt-3">
                    <strong>8.2.</strong> Le Preneur aura, notamment, la charge
                    de l’utilisation d’eau, de téléphone et de tous autres
                    services. Le Bailleur aura la charge d’électricité.
                </p>

                <SectionTitle>ARTICLE 9 : CESSION</SectionTitle>

                <p>
                    Le bailleur autorise expressément, dès à présent, la
                    cession du présent bail au profit de NYLC S.A. ou toute
                    personne désignée par celle-ci, ci-après désigné « le
                    Cessionnaire autorisé ».
                </p>
                <p className="mt-3">
                    La cession pourra intervenir à tout moment, à la demande du
                    Cessionnaire autorisé, sans que l’accord préalable et écrit
                    du bailleur ne soit requis, sous réserve d’une simple
                    notification écrite adressée au bailleur.
                </p>
                <p className="mt-3">
                    À compter de la cession, le cessionnaire sera pleinement
                    subrogé dans les droits et obligations du preneur au titre
                    du présent bail. Le preneur initial sera libéré de toute
                    obligation future, sauf clause contraire expressément
                    stipulée dans l’acte de cession.
                </p>

                <SectionTitle>ARTICLE 10 : REVISION - MODIFICATION</SectionTitle>

                <p>
                    Le fait pour l'une des parties de s'abstenir de réclamer
                    l'application de l'une des clauses contenues au présent
                    contrat n'implique ni acquiescement ni modification du bail.
                </p>
                <p className="mt-3">
                    Toute révision ou modification du présent contrat ne pourra
                    résulter que d'un écrit, signé des deux parties ou de leurs
                    représentants dûment mandatés à cet effet. Cette
                    modification sera alors annexée au présent contrat.
                </p>

                <SectionTitle>
                    ARTICLE 11 : DROIT DE RESILIATION ANTICIPEE - CAS DE FORCE
                    MAJEURE - FAIT DU PRINCE
                </SectionTitle>

                <p>
                    Si le Preneur souhaite résilier de façon anticipée le
                    présent bail (avant l'échéance du terme prévu), il donnera
                    un préavis de trois (3) mois au Bailleur qui en sera
                    informé, par lettre avec accusé de réception, ou lui
                    paieront en cas de résiliation immédiate des indemnités
                    équivalant à TROIS (3) mois de loyer.
                </p>

                <SectionTitle>
                    ARTICLE 12 : INOBSERVATION DES CLAUSES DU CONTRAT
                </SectionTitle>

                <p>
                    Toute violation par le Preneur ou le Bailleur d'une seule
                    des clauses et conditions du présent contrat, entraînera sa
                    résiliation de plein droit sans délai ni procédure par la
                    partie qui aura invoqué et établi le manquement.
                </p>

                <SectionTitle>ARTICLE 13 : LITIGE</SectionTitle>

                <p>
                    Les parties s'engagent à exécuter de bonne foi les clauses
                    du présent contrat. Toute contestation ou litige auquel le
                    présent contrat pourrait donner lieu tant pour sa validité,
                    son interprétation que pour son exécution ou sa résiliation,
                    sera soumis à la juridiction compétente.
                </p>
                <p className="mt-3">
                    En cas d'inexécution d'une des clauses du présent contrat
                    par l'une des parties, celle-ci sera entièrement
                    responsable des frais de justice et des honoraires
                    d'avocats encourus.
                </p>

                <SectionTitle>ARTICLE 14 : DISPOSITIONS GENERALES</SectionTitle>

                <p>
                    Pour tout ce qui n'aurait pas fait l'objet d'une clause
                    spéciale, les parties au contrat se réfèrent aux
                    dispositions légales régissant la matière en HAÏTI.
                </p>
                <p className="mt-3">
                    Pour l'exécution des présentes, les parties déclarent faire
                    élection de domicile à <InlineField className="min-w-[220px]" />
                    .
                </p>
                <p className="mt-3">
                    Le présent contrat comporte quatorze (14) articles.
                </p>

                <div className="mt-8">
                    <p>
                        Fait à <InlineField className="min-w-[220px]" />, de
                        bonne foi et en double original le{' '}
                        <InlineField className="min-w-[220px]" />.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-2 gap-12 text-lg">
                    <div>
                        <p className="mb-12">Bailleur :</p>
                        <p>_____________________</p>
                    </div>

                    <div>
                        <p className="mb-12">Preneur :</p>
                        <p>_________________________</p>
                        <p className="text-base mt-2">
                            Coordonnateur des Opérations
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const scopeId = `contract-scope`
    const overrideCss =
        (headerSize
            ? `.${scopeId} h1, .${scopeId} h2, .${scopeId} h3 { font-size: ${headerSize}px !important; }`
            : '') +
        (descSize
            ? ` .${scopeId} p, .${scopeId} span, .${scopeId} div { font-size: ${descSize}px !important; }`
            : '')

    return (
        <div className={`mx-auto ${scopeId}`}>
            {overrideCss && <style>{overrideCss}</style>}
            {landlord &&
                (version === 'v1' ? renderContractV1() : renderContractV2())}
        </div>
    )
}

export default LeaseContractForm