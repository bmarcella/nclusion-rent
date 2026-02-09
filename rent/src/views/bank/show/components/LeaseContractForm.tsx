/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bank, Proprio } from '@/views/Entity';
import React, { useEffect, useState } from 'react';
import UserName from './UserName';
import { getLandlordById } from '@/services/firebase/LandlordService';
import { getRegionsById, RegionType } from '@/views/Entity/Regions';
import n2words from 'n2words';
import FrenchDate from './FrenchDate ';
import useTranslation from '@/utils/hooks/useTranslation';

interface Props {
    bank: Bank ;
}

const LeaseContractForm = ({ bank }: Props) => {
    const [landlord, setLL] = useState<Proprio | null>(null);
    const [lreg, setLReg] = useState<RegionType | null>(null);
    const [breg, setBReg] = useState<RegionType | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const getLL = async () => {
            const landlord = await getLandlordById(bank.landlord) as Proprio;
            setLL(landlord);
            if (landlord && landlord?.regions?.[0])
                setLReg(getRegionsById(landlord.regions[0]));
            setBReg(getRegionsById(Number(bank.id_region)));
        };
        getLL();
    }, [bank]);

    return (
        <>
            {landlord && (
                <div className="mx-auto p-6 bg-white rounded-lg text-gray-800 leading-relaxed text-lg">

                    <h1 className="text-2xl font-bold text-center mb-6">CONTRAT DE BAIL</h1>

                    <p className="mb-4 font-semibold text-xl">ENTRE :</p>
                    <div className="mb-6 text-lg">
                        <p>
                            <span className="border-b border-gray-400 pt-4 mr-2">{landlord.fullName}{' '}</span> demeurant et domicilié à :
                            <span className="w-auto border-b border-gray-400 mr-2">{landlord.address}, {landlord.city}, {lreg?.label}</span>,
                            <span className="w-auto border-b border-gray-400 mr-2">Tel : {landlord.phone} {landlord.phone_b ? `/ ${landlord.phone_b}` : null}.</span>
                            identifié au No.
                            {landlord.cin && <span className="w-auto border-b border-gray-400 mr-2">NIN : {landlord.cin}, </span>}
                            {landlord.nif && <span className="w-auto border-b border-gray-400 mr-2">NIF : {landlord.nif}</span>}
                        </p>
                        <p className="mt-1">
                            Agissant en qualité de copropriétaire, ci-après dénommé <strong>le « Bailleur »</strong>, d’une part ;
                        </p>
                    </div>

                    <p className="mb-4 font-semibold text-xl">ET</p>
                    <div className="mb-6 text-lg">
                        <p>
                            <strong>NYLC S.A.</strong>, société anonyme constituée en vertu des lois haïtiennes, ayant son siège
                            social au #11, rue Ogé, Pétion-Ville, Delmas, Haiti. Représentée par Monsieur
                            <span className="inline-block w-auto border-b border-gray-400 ml-2">
                                {/* <UserName userId={bank.finalDecision?.createdBy} /> */}
                                </span>
                                <span className="inline-block w-100 border-b border-gray-400 mx-2" />
                                
                                 en qualité de
                            coordonnateur/superviseur, ci-après dénommée la <strong>« Preneuse »</strong>, d’autre part.
                        </p>
                    </div>

                    <h2 className="text-xl font-semibold mt-6 mb-2">Article 1 - Objet</h2>
                    <p className="text-lg">
                        Le Bailleur donne en bail un espace situé au :
                        <span className="inline-block w-auto border-b border-gray-400 ml-2 mr-2">{bank.addresse}, {bank.city}, {breg?.label}</span>.
                        Recouvert en <span className="inline-block w-auto border-b border-gray-400 ml-2 mr-2">{(bank.securityDetails?.roof) ? t('bank.' + bank.securityDetails?.roof) : 'Tôle ou béton'}</span>, d’une
                        superficie : <span className="inline-block w-auto border-b border-gray-400 ml-2">{bank.superficie}</span> m²,
                        comprenant <span className="inline-block w-auto border-b border-gray-400 ml-2 mr-2">{bank.nombre_chambre}</span> pièces/chambres.
                    </p>

                    <p className="mt-2 text-lg">
                        Utilités : toilette (oui/non), accès à l’eau (oui/non), électricité (oui/non).
                    </p>

                    <p className="mt-2 text-lg">Destination : à des fins commerciales.</p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">Article 2 - Durée</h2>
                    <p className="text-lg">
                        Durée :
                        <span className="inline-block w-auto border-b border-gray-400 ml-2 mr-2">{bank.yearCount}</span> année(s), du
                        <span className="inline-block w-auto border-b border-gray-400 ml-2 mr-r"><FrenchDate dateString={bank.date} /></span> au
                        <span className="inline-block w-auto border-b border-gray-400 ml-2 mr-r"><FrenchDate dateString={bank.date} y={bank.yearCount} /></span>.
                    </p>

                    <p className="mt-2 text-lg">
                        Renouvelable par tacite reconduction pour une année selon les mêmes termes.
                    </p>

                    <h2 className="text-xl font-semibold mt-6 mb-2">Article 3 - Loyer</h2>
                    <p className="text-lg">
                        Montant :
                        <span className="inline-block w-auto border-b border-gray-400 ml-2">HTG {new Intl.NumberFormat('fr-FR').format(Number(bank?.final_rentCost || 0))}</span> (
                        <span className="inline-block w-auto uppercase border-b border-gray-400 mx-2">{n2words(bank?.final_rentCost || 0, { lang: 'fr' })}</span>) payable à la date d’entrée dans
                        les lieux.
                    </p>

                    {(!bank?.final_rentCost || bank?.final_rentCost == 0) &&
                        <p className="text-red-400 text-lg">
                            Le montant du loyer est égal à 0, vous devez aller le modifier dans la section Banks Actives → Contrat
                        </p>
                    }

                    <div className="mt-6 text-lg">
                        <p>
                            Fait au <span className="inline-block w-48 border-b border-gray-400 mx-2" />, de bonne foi, et en double original, le
                            <span className="inline-block w-48 border-b border-gray-400 mx-2" />.
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

                    <h3 className="text-xl font-semibold mt-8">Consentement additionnel :</h3>
                    <div className="h-12 border border-gray-300 rounded mt-2" />
                </div>
            )}
        </>
    );
};

export default LeaseContractForm;
