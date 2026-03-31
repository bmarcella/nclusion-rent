/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/exportRequestsCsv.ts
import Papa from 'papaparse'
import { saveAs } from 'file-saver'
import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'
import { getRegionsById } from '@/views/Entity/Regions'
import { IRequest } from '../entities/IRequest'
import {
    getRequestCategorieById,
    getRequestType,
} from '../entities/AuthRequest'
import { Proprio } from '@/views/Entity'

const formatDate = (value: any) => {
    if (!value) return '-'
    const date = value instanceof Date ? value : value.toDate?.() || value
    return formatRelative(date, new Date(), { locale: fr })
}

const formatMoney = (value: any) => {
    if (value == null || value === '') return '-'
    const n = Number(value)
    if (Number.isNaN(n)) return String(value)
    return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })
}

// pick a “main amount” depending on type_request (same idea you used in Details/Print)
const getMainAmount = (r: IRequest) =>
    r.bill?.price ??
    r.divers?.price ??
    r.opex?.amount ??
    r.telecom?.total_price ??
    r.locomotif?.price ??
    r.legal?.price ??
    r.bank_renovation?.total_amount ??
    r.lease_payment?.rentCost ??
    r.transport_logistique?.amount ??
    ''

// best-effort categorie + subtype for each request type
const getCategorieAndSubType = (r: IRequest) => {
    const tr = r.general?.type_request

    const section: any =
        (tr === 'bill' && r.bill) ||
        (tr === 'divers' && r.divers) ||
        (tr === 'capex' && r.capex) ||
        (tr === 'telecom' && r.telecom) ||
        (tr === 'opex' && r.opex) ||
        (tr === 'locomotif' && r.locomotif) ||
        (tr === 'bank_renovation' && r.bank_renovation) ||
        (tr === 'transport_logistique' && r.transport_logistique) ||
        (tr === 'lease_payment' && r.lease_payment) ||
        (tr === 'legal' && r.legal)

    return {
        categorie: section?.categorie,
        subType: section?.type, // many of your sections have `.type`
    }
}

export function exportRequestsCsv(params: {
    requests: IRequest[]
    t: (k: string) => string
    proprios: any
    filename?: string
}) {
    const {
        requests,
        t,
        filename = `requests-${Date.now()}.csv`,
        proprios,
    } = params
    const getProprio = (created_by: string) => {
        return proprios.get(created_by)
    }
    const filteredRequests = requests.filter(
        (r) => r.general?.id_region_user != 10,
    )

    const rows = filteredRequests.map((r: IRequest) => {
        const g: any = r.general ?? {}
        const { categorie, subType } = getCategorieAndSubType(r)

        const regionLabel =
            g.id_region_user != null
                ? (getRegionsById(g.id_region_user)?.label ??
                  String(g.id_region_user))
                : '-'

        const categorieLabel =
            categorie != null
                ? getRequestCategorieById(t, r.requestType, categorie)
                : '-'

        const typeLabel =
            categorie != null && subType != null
                ? getRequestType(t, r.requestType, categorie, subType)
                : '-'
        const proprio: Proprio = getProprio(r.createdBy)
        const name = proprio ? proprio.fullName : r.createdBy
        const role = proprio ? proprio.type_person : '-'
        return {
            ID: (r as any).id ?? (r as any)._id ?? '',
            Status: (r as any).status ?? (r as any).state ?? '',
            'Request type': g.type_request ?? '-',
            Region: regionLabel,
            'Payment method': g.paymentMethod ?? '-',
            Currency: g.currency ?? '-',
            Beneficiary: g.beneficiaryName ?? '-',
            Amount: `${formatMoney(getMainAmount(r))}`.trim(),
            Category: categorieLabel,
            'Sub-Category': typeLabel,
            'Created at': formatDate((r as any).createdAt),
            CreatedByID: r.createdBy,
            Creator: name,
            'Creator role': role,
            'Approved by Coordonator':
                getProprio(r.regionalApproved_by)?.fullName ??
                r.regionalApproved_by ??
                '-',
            'Approved by accountant':
                getProprio(r.accountantApproval)?.fullName ??
                r.accountantApproval ??
                '-',
            'Approved by manager':
                getProprio(r.managerGlobalApproval)?.fullName ??
                r.managerGlobalApproval ??
                '-',
            'Rejected by':
                getProprio(r.rejectedBy ?? '')?.fullName ?? r.rejectedBy ?? '-',
            'Cancelled by':
                getProprio(r.cancelledBy ?? '')?.fullName ??
                r.cancelledBy ??
                '-',
            'Completed by':
                getProprio(r?.completedBy ?? '')?.fullName ??
                r.completedBy ??
                '-',
        }
    })

    const csv = Papa.unparse(rows)
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    saveAs(blob, filename)
}
