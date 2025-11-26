/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IRequest } from '../entities/IRequest';
import { Card } from '@/components/ui';
import MoneyRequestNextStatusButton from './MoneyRequestNextStatusButton';
import { getRegionsById } from '@/views/Entity/Regions';
import { getExpenseRequestDoc } from '@/services/Landlord';
import { getDoc, updateDoc } from 'firebase/firestore';
import { useSessionUser } from '@/store/authStore';
import { useState } from 'react';
import { formatRelative } from 'date-fns/formatRelative';
import { fr } from 'date-fns/locale';
import { AuthRequest } from '../entities/AuthRequest';

interface Props {
  data: IRequest;
  rules : AuthRequest []
  getNewreq :(data: IRequest)=>void 
}

function DetailsRequest({ data , rules, getNewreq}: Props) {
  // In many backends, the "business payload" is nested (e.g. data.request).
  // If not, we fall back to using `data` directly.
  const [request , setRequest]=  useState<IRequest>(data) as any;

  const general = request.general ?? {};
  const typeRequest = general.type_request as string | undefined;
   const { userId, authority, proprio } = useSessionUser((state) => state.user);
  const metaId = (data as any).id ?? (data as any)._id ?? '';
  const metaStatus = (data as any).status ?? (data as any).state ?? '';

  const formatDate = (value: any) => {
    if (!value) return '-';
       return  formatRelative(value.toDate?.() || value, new Date(), { locale: fr } )  
  };

  const formatMoney = (value: any) => {
    if (value == null || value === '') return '-';
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const onNextStatus = (data: string, validated)=>{
      updateMoneyRequestStatus(data);
  }

 const  updateMoneyRequestStatus = async (
  nextStatus: string,
) => {
  if (!data.id) {
    throw new Error("updateMoneyRequestStatus: requestId is required");
  }
  const ref = getExpenseRequestDoc(data.id) 

  // Clone the array to avoid mutating original state directly (React rule)
  const hist = [...data.historicApproval];

  hist.unshift({
            status_to: nextStatus,
            status_from: data.status,
            by_who: userId!,
            createdAt: new Date(),
   });

  const payload: Record<string, any> = {
    status: nextStatus,
    historicApproval : hist
  };
  await updateDoc(ref, payload);
  // 👉 Fetch the updated document
  const snapshot = await getDoc(ref);
  const new_req = { id: snapshot.id, ...snapshot.data() } as IRequest;
  setRequest(new_req);
  getNewreq(new_req);

}

const getValidateState = ()=> {

}

  // ---- Section renderers ----------------------------------------------------

  const renderBill = () => {
    if (!request.bill) return null;
    const { price, description, target_date } = request.bill;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Bill</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Amount</div>
            <div>{formatMoney(price)} {general.currency}</div>
          </div>
          <div>
            <div className="font-bold">Target date</div>
            <div>{formatDate(target_date)}</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="font-bold">Description</div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </Card>
    );
  };

  const renderCapex = () => {
    if (!request.capex) return null;
    const { type, quantity, price, provider, beneficiary, target_date, decripstion } = request.capex;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Capex</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Type</div>
            <div>{type}</div>
          </div>
          <div>
            <div className="font-bold">Quantity</div>
            <div>{quantity}</div>
          </div>
          <div>
            <div className="font-bold">Unit price</div>
            <div>{formatMoney(price)} {general.currency}</div>
          </div>
          <div>
            <div className="font-bold">Target date</div>
            <div>{formatDate(target_date)}</div>
          </div>
          <div>
            <div className="font-bold">Provider</div>
            <div>{provider}</div>
          </div>
          <div>
            <div className="font-bold">Beneficiary</div>
            <div>{beneficiary}</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="font-bold">Description</div>
          <p className="text-sm whitespace-pre-wrap">{decripstion}</p>
        </div>
      </Card>
    );
  };

  const renderLocomotif = () => {
    if (!request.locomotif) return null;
    const { spent_type, type_locomotif, plaque, provider, price, description } = request.locomotif;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Locomotif</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Spent type</div>
            <div>{spent_type}</div>
          </div>
          <div>
            <div className="font-bold">Type</div>
            <div>{type_locomotif}</div>
          </div>
          <div>
            <div className="font-bold">Plaque</div>
            <div>{plaque}</div>
          </div>
          <div>
            <div className="font-bold">Provider</div>
            <div>{provider}</div>
          </div>
          <div>
            <div className="font-bold">Price</div>
            <div>{formatMoney(price)} {general.currency}</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="font-bold">Description</div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </Card>
    );
  };

  const renderTelecom = () => {
    if (!request.telecom) return null;
    const { plans = [], description, total_price } = request.telecom;
    return (
      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Telecom</h3>

        <div className="text-sm">
          <div className="font-bold">Total price</div>
          <div>{formatMoney(total_price)} {general.currency}</div>
        </div>

        <div>
          <div className="font-bold mb-1">Description</div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>

        {Array.isArray(plans) && plans.length > 0 && (
          <div className="space-y-2">
            <div className="font-bold">Plans</div>
            {plans.map((p: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-lg p-2 text-sm grid grid-cols-1 md:grid-cols-3 gap-2"
              >
                <div>
                  <div className="font-bold">Beneficiary</div>
                  <div>{p.beneficiary}</div>
                </div>
                <div>
                  <div className="font-bold">Provider</div>
                  <div>{p.provider}</div>
                </div>
                <div>
                  <div className="font-bold">Plan type</div>
                  <div>{p.plan_type}</div>
                </div>
                <div>
                  <div className="font-bold">Start date</div>
                  <div>{formatDate(p.start_date)}</div>
                </div>
                <div>
                  <div className="font-bold">End date</div>
                  <div>{formatDate(p.end_date)}</div>
                </div>
                <div>
                  <div className="font-bold">Price</div>
                  <div>{formatMoney(p.price)} {general.currency}</div>
                </div>
                <div>
                  <div className="font-bold">ID card</div>
                  <div>{p.id_card}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderOpex = () => {
    if (!request.opex) return null;
    const { categorie, other_categorie, items = [], amount, description, masterbankId } = request.opex;
    return (
      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Opex</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Category</div>
            <div>{categorie}</div>
          </div>
          {categorie === 'autre' && (
            <div>
              <div className="font-bold">Other category</div>
              <div>{other_categorie || '-'}</div>
            </div>
          )}
          <div>
            <div className="font-bold">Amount</div>
            <div>{formatMoney(amount)} {general.currency}</div>
          </div>
          <div>
            <div className="font-bold">Master bank ID</div>
            <div>{masterbankId || '-'}</div>
          </div>
        </div>

        <div>
          <div className="font-bold mb-1">Description</div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>

        {Array.isArray(items) && items.length > 0 && (
          <div className="space-y-2">
            <div className="font-bold">Items</div>
            {items.map((it: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-lg p-2 text-sm grid grid-cols-4 gap-2"
              >
                <div className="col-span-2">
                  <div className="font-bold">Name</div>
                  <div>{it.name}</div>
                </div>
                <div>
                  <div className="font-bold">Qty</div>
                  <div>{it.quantity}</div>
                </div>
                <div>
                  <div className="font-bold">Total</div>
                  <div>{formatMoney(it.total_price)} {general.currency}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderTransport = () => {
    if (!request.transport_logistique) return null;
    const t = request.transport_logistique;
    return (
      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Transport &amp; Logistique</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="font-bold">Transport date</div>
            <div>{formatDate(t.transport_date)}</div>
          </div>
          <div>
            <div className="font-bold">Done by an employee</div>
            <div>{t.donebyAnEmployee ? 'Yes' : 'No'}</div>
          </div>
          <div>
            <div className="font-bold">Amount</div>
            <div>{formatMoney(t.amount)} {general.currency}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold mb-1">From</div>
            <div>Region: {t.From?.region}</div>
            <div>City: {t.From?.city}</div>
            <div>Street: {t.From?.street || '-'}</div>
          </div>
          <div>
            <div className="font-bold mb-1">To</div>
            <div>Region: {t.To?.region}</div>
            <div>City: {t.To?.city}</div>
            <div>Street: {t.To?.street || '-'}</div>
          </div>
        </div>

        {t.purpose && (
          <div>
            <div className="font-bold mb-1">Purpose</div>
            <p className="text-sm whitespace-pre-wrap">{t.purpose}</p>
          </div>
        )}

        {Array.isArray(t.items) && t.items.length > 0 && (
          <div className="space-y-2">
            <div className="font-bold">Items</div>
            {t.items.map((it: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-lg p-2 text-sm grid grid-cols-2 gap-2"
              >
                <div>
                  <div className="font-bold">Name</div>
                  <div>{it.name}</div>
                </div>
                <div>
                  <div className="font-bold">Qty</div>
                  <div>{it.quantity}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  const renderBankRenovation = () => {
    if (!request.bank_renovation) return null;
    const b = request.bank_renovation;
    return (
      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Bank Renovation</h3>

        {Array.isArray(b.Bank) && b.Bank.length > 0 && (
          <div className="space-y-2">
            <div className="font-bold">Banks</div>
            {b.Bank.map((bk: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-lg p-2 text-sm grid grid-cols-2 gap-2"
              >
                <div>
                  <div className="font-bold">Bank name</div>
                  <div>{bk.bankName}</div>
                </div>
                <div>
                  <div className="font-bold">Amount</div>
                  <div>{formatMoney(bk.amount)} {general.currency}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md-grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Type of renovation</div>
            <div>{b.type_renovation}</div>
          </div>
          <div>
            <div className="font-bold">Total amount</div>
            <div>{formatMoney(b.total_amount)} {general.currency}</div>
          </div>
          <div>
            <div className="font-bold">Start date</div>
            <div>{formatDate(b.start_date)}</div>
          </div>
          <div>
            <div className="font-bold">End date</div>
            <div>{formatDate(b.end_date)}</div>
          </div>
          <div>
            <div className="font-bold">Vendor ID</div>
            <div>{b.vendor_id}</div>
          </div>
          <div>
            <div className="font-bold">Vendor name</div>
            <div>{b.vendor_name}</div>
          </div>
          <div>
            <div className="font-bold">Contract ID</div>
            <div>{b.contract_id}</div>
          </div>
        </div>

        <div>
          <div className="font-bold mb-1">Description</div>
          <p className="text-sm whitespace-pre-wrap">{b.description}</p>
        </div>
      </Card>
    );
  };

  const renderLeasePayment = () => {
    if (!request.lease_payment) return null;
    const l = request.lease_payment;
    return (
      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Lease Payment</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Bank ID</div>
            <div>{l.id_bank}</div>
          </div>
          <div>
            <div className="font-bold">Bank name</div>
            <div>{l.bankName}</div>
          </div>
          <div>
            <div className="font-bold">Landlord ID</div>
            <div>{l.id_landlord}</div>
          </div>
          <div>
            <div className="font-bold">Landlord name</div>
            <div>{l.landlordName}</div>
          </div>
          <div>
            <div className="font-bold">Start date</div>
            <div>{
               formatDate(l.start_date)}
            </div>
          </div>
          <div>
            <div className="font-bold">End date</div>
            <div>{ formatDate(l.end_date)}</div>
          </div>
          <div>
            <div className="font-bold">Years</div>
            <div>{l.yearNumber}</div>
          </div>
          <div>
            <div className="font-bold">Rent cost</div>
            <div>{formatMoney(l.rentCost)} {general.currency}</div>
          </div>
          <div>
            <div className="font-bold">Who approves the bank</div>
            <div>{l.whoApproveTheBank}</div>
          </div>
          <div>
            <div className="font-bold">Created by</div>
            <div>{l.create_by}</div>
          </div>
          <div>
            <div className="font-bold">Renovation by the landlord</div>
            <div>{l.renovationByTheLandlord ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {l.description && (
          <div>
            <div className="font-bold mb-1">Description</div>
            <p className="text-sm whitespace-pre-wrap">{l.description}</p>
          </div>
        )}
      </Card>
    );
  };

  const renderLegal = () => {
    if (!request.legal) return null;
    const { beneficiary, price, description, target_date } = request.legal;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Legal</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Beneficiary</div>
            <div>{beneficiary}</div>
          </div>
          <div>
            <div className="font-bold">Price</div>
            <div>{formatMoney(price)} {general.currency}</div>
          </div>
          <div>
            <div className="font-bold">Target date</div>
            <div>{formatDate(target_date)}</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="font-bold">Description</div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </Card>
    );
  };

  // ---- Bank info & documents -----------------------------------------------

  const renderBankInfo = () => {
    if (!request.BankInfo) return null;
    const { BankName, AccountName, AccountNumber, SWIFT } = request.BankInfo;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Bank information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Bank name</div>
            <div>{BankName}</div>
          </div>
          <div>
            <div className="font-bold">Account name</div>
            <div>{AccountName}</div>
          </div>
          <div>
            <div className="font-bold">Account number</div>
            <div>{AccountNumber}</div>
          </div>
          <div>
            <div className="font-bold">SWIFT</div>
            <div>{SWIFT || '-'}</div>
          </div>
        </div>
      </Card>
    );
  };

  const renderDocuments = () => {
    if (!Array.isArray(request.documents) || request.documents.length === 0) return null;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Documents</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          {request.documents.map((d: any, idx: number) => (
            <li key={idx}>
              <span className="font-bold">Type:</span> {d.type}
            </li>
          ))}
        </ul>
      </Card>
    );
  };

  // ---- Choose which main section to show -----------------------------------

  const renderMainSection = () => {
    switch (typeRequest) {
      case 'bill':
        return renderBill();
      case 'capex':
        return renderCapex();
      case 'locomotif':
        return renderLocomotif();
      case 'telecom':
        return renderTelecom();
      case 'opex':
        return renderOpex();
      case 'transport_logistique':
        return renderTransport();
      case 'bank_renovation':
        return renderBankRenovation();
      case 'lease_payment':
        return renderLeasePayment();
      case 'legal':
        return renderLegal();
      default:
        return (
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              No specific section found for this request type.
            </p>
          </Card>
        );
    }
  };

  // ---- Render --------------------------------------------------------------

  return (
    <div className="space-y-4">
      {/* Header / meta */}
      <Card className="p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Request Details</h2>
            {metaId && (
              <p className="text-xs text-muted-foreground">
                ID: <span className="font-mono">{metaId}</span>
              </p>
            )}
          </div>
          {metaStatus && (
            <span className="px-2 py-1 rounded-full text-xs bg-slate-100">
              {String(metaStatus).toUpperCase()}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm mt-3">
          <div>
            <div className="font-bold">Type of request</div>
            <div>{typeRequest || '-'}</div>
          </div>
          <div>
            <div className="font-bold">Payment method</div>
            <div>{general.paymentMethod || '-'}</div>
          </div>
          <div>
            <div className="font-bold">Currency</div>
            <div>{general.currency || '-'}</div>
          </div>
          <div>
            <div className="font-bold">Beneficiary name</div>
            <div>{general.beneficiaryName || '-'}</div>
          </div>
          <div>
            <div className="font-bold">Region</div>
            <div>{ getRegionsById(general.id_region_user).label }</div>
          </div>
          <div>
            <b className="font-bold ">Created at</b>
            <div>{    formatRelative(data.createdAt.toDate?.() || data.createdAt, new Date(), { locale: fr } )  }</div>
          </div>
        </div>

        {general.is_for_other && (
          <div className="text-sm mt-2">
            <span className="font-bold">On behalf of:</span>{' '}
            {general.on_behalf_user_id || '-'}
          </div>
        )}
      </Card>

      {renderBankInfo()}

      {renderMainSection()}

      {renderDocuments() }
      <MoneyRequestNextStatusButton request={request} onNextStatus={onNextStatus}></MoneyRequestNextStatusButton>
    </div>
  );
}

export default DetailsRequest;
