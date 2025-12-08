/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { IRequest } from "../entities/IRequest";
import { Card, Button } from "@/components/ui";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale";
import { BiPrinter } from "react-icons/bi";
import { getRequestCategorieById, getRequestType } from "../entities/AuthRequest";
import { useTranslation } from "react-i18next";
import UserName from "@/views/bank/show/components/UserName";
import { getRegionsById } from "@/views/Entity/Regions";

interface Props {
    request: IRequest;
}

const PrintRequest: React.FC<Props> = ({ request }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const type = useMemo(() => request?.requestType, [request?.requestType]);
    const { t } = useTranslation();
    const [pdf, setPdf] = useState(false);
    const formatDate = (value: any) => {
        if (!value) return "-";
        const date = value instanceof Date ? value : value.toDate?.() || value;
        return formatRelative(date, new Date(), { locale: fr });
    };

    const formatMoney = (value: any) => {
        if (value == null || value === "") return "-";
        const n = Number(value);
        if (Number.isNaN(n)) return String(value);
        return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // ---- React-to-print handler ----
    const reactToPrintFn = useReactToPrint({
        contentRef: contentRef,
        documentTitle: `Request_${request.id}`,
    });

    // 
    const print = async () => {
        setPdf(true);
        setTimeout(async () => {
            await reactToPrintFn();
            setPdf(false);
        }, 2000);
    }

    // ---- Render sections ----
    const renderBill = () => {
        const b = request.bill;
        if (!b) return null;
        return (
            <Card className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">Bill</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
                    <div><b>Amount:</b> {formatMoney(b.price)} {request.general?.currency}</div>
                    <div><b>Target date:</b> {formatDate(b.target_date)}</div>
                    <div>
                        <div className="font-bold">Categorie</div>
                        <div>{getRequestCategorieById(t, type, b.categorie)} </div>
                    </div>
                    <div>
                        <div className="font-bold">Type</div>
                        <div>{getRequestType(t, type, b.categorie, b?.type)} </div>
                    </div>
                </div>
                <div className="mt-4">
                    <b>Description:</b>
                    <p className="text-sm whitespace-pre-wrap">{b.description}</p>
                </div>
            </Card>
        );
    };

    const renderCapex = () => {
        if (!request.capex) return null;
        const {  quantity, price, provider, target_date, decripstion, categorie } = request.capex;
        const ntype = request.capex.type;
        return (
        <Card className="p-4 space-y-2">
            <h3 className="text-lg font-semibold">Capex</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
                <div className="font-bold">Categorie</div>
                <div>{getRequestCategorieById(t, type, categorie)} </div>
            </div>
            { ntype && <div>
                <div className="font-bold">Type</div>
                <div>{getRequestType(t, type, categorie, ntype)} </div>
            </div> } 
            <div>
                <div className="font-bold">Quantity</div>
                <div>{quantity}</div>
            </div>
            <div>
                <div className="font-bold">Unit price</div>
                <div>{formatMoney(price)} {request?.general?.currency}</div>
            </div>
            <div>
                <div className="font-bold">Target date</div>
                <div>{formatDate(target_date)}</div>
            </div>
            <div>
                <div className="font-bold">Fournisseur</div>
                <div>{provider}</div>
            </div>

            
            
            </div>
            <div className="mt-2">
            <div className="font-bold">Description</div>
            <p className="text-sm whitespace-pre-wrap">{decripstion}</p>
            </div>
        </Card>
        );
    };

   const renderTelecom = () => {
    if (!request.telecom) return null;
    const { plans = [], description, total_price, categorie } = request.telecom;
    return (
      <Card className="p-4 space-y-3">
        <h3 className="text-lg font-semibold">Telecom</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-4 mb-4">
              <div className="text-sm">
                  <div className="font-bold">Total price</div>
                  <div>{formatMoney(total_price)} {request?.general?.currency}</div>
                </div>
                 <div>
            <div className="font-bold">Categorie</div>
            <div>{getRequestCategorieById(t, type, categorie)} </div>
          </div>
    
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
                  <div>{formatMoney(p.price)} {request?.general?.currency}</div>
                </div>
                <div>
                  <div className="font-bold">Nif / NIN</div>
                  <div>{p.id_card || '-'}</div>
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
            <div className="font-bold">Categorie</div>
            <div>{getRequestCategorieById(t, type, categorie)} </div>
          </div>
          {categorie == 0 && (
            <div>
              <div className="font-bold">Other category</div>
              <div>{other_categorie || '-'}</div>
            </div>
          ) }
           {/* <div>
            <div className="font-bold">Type</div>
            <div>{getRequestType(t, type, categorie, request.opex?.type)} </div>
          </div> */}
          <div>
            <div className="font-bold">Amount</div>
            <div>{formatMoney(amount)} {request?.general?.currency}</div>
          </div>

          <div>
            <div className="font-bold"> ID Bank</div>
            <div>{masterbankId || '-'}</div>
          </div>
        </div>

        <div className='mt-4 mb-4'>
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
                  <div>{formatMoney(it.total_price)} {request?.general?.currency}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

    const renderSignatures = () => {
        const hhistory = request.historicApproval || [];
        if (hhistory.length === 0) return null;
        const h = hhistory[hhistory.length-1];
        const history = hhistory.slice(0, -1);;
        return (<>
        <Card className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">Crée par </h3>
                <div className="space-y-1 text-sm">
                     <div  className="flex justify-between">
                            <div>{" "} Par: <UserName userId={h.by_who} /></div>
                            <div>Date: {formatDate(h.createdAt)}</div>
                    </div>
                </div>
            </Card>
         { history && history.length > 0 && <Card className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">Signatures / Approvals</h3>
                <div className="space-y-1 text-sm">
                    {history.map((h, i) => (
                        (<div key={i} className="flex justify-between">
                            <div><b>{h.status_from ? h.status_from + " → " : 'Crée'} </b></div>
                            <div>{" "} Par: <UserName userId={h.by_who} /></div>
                            <div>Date: {formatDate(h.createdAt)}</div>
                        </div>) 
                    ))}
                </div>
            </Card> }
        </>
          
        );
    };

    const renderLeasePayment = () => {
        if (!request.lease_payment) return null;
        const l = request.lease_payment;
        const general = request.general;
        return (
            <Card className="p-4 space-y-3">
                <h3 className="text-lg font-semibold mb-4">Lease Payment</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                        <div className="font-bold">Bank name</div>
                        <div>{l.bankName}</div>
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
                        <div>{formatDate(l.end_date)}</div>
                    </div>
                    <div>
                        <div className="font-bold">Years</div>
                        <div>{l.yearNumber}</div>
                    </div>
                    <div>
                        <div className="font-bold">Rent cost</div>
                        <div>{formatMoney(l.rentCost)} {general?.currency}</div>
                    </div>
                    <div>
                        <div className="font-bold">Who approves the bank</div>
                        <div> <UserName userId={l.whoApproveTheBank} /></div>
                    </div>
                    <div>
                        <div className="font-bold">Created by</div>
                        <div>
                            <UserName userId={l.create_by} />
                        </div>
                    </div>
                    <div>
                        <div className="font-bold">Renovation by the landlord</div>
                        <div>{l.renovationByTheLandlord ? 'Yes' : 'No'}</div>
                    </div>
                </div>

                {l.description && (
                    <div className='mb-4'>
                        <div className="font-bold mb-1 mt-4">Description</div>
                        <p className="text-sm whitespace-pre-wrap">{l.description}</p>
                    </div>
                )}
            </Card>
        );
    };

    const renderLocomotif = () => {
    if (!request.locomotif) return null;
    const { categorie, type_locomotif, plaque, provider, price, description } = request.locomotif;
    return (
      <Card className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">Locomotif</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-bold">Categorie</div>
            <div>{getRequestCategorieById(t, type, categorie)} </div>
          </div>
          <div>
            <div className="font-bold">Type Locomotif</div>
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
            <div>{formatMoney(price)} {request?.general?.currency}</div>
          </div>
        </div>
        <div className="mt-2">
          <div className="font-bold">Description</div>
          <p className="text-sm whitespace-pre-wrap">{description}</p>
        </div>
      </Card>
    );
  };

    const renderBankInfo = () => {
        const b = request.BankInfo;
        if (!b) return null;
        return (
            <Card className="p-4 space-y-2">
                <h3 className="text-lg font-semibold">Bank Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><b>Bank name:</b> {b.BankName}</div>
                    <div><b>Account name:</b> {b.AccountName}</div>
                    <div><b>Account number:</b> {b.AccountNumber}</div>
                    {b.SWIFT && <div><b>SWIFT:</b> {b.SWIFT}</div>}
                </div>
            </Card>
        );
    };
    const renderTransport = (tt: any) => {
    
        if (!request.transport_logistique) return null;
        const t = request.transport_logistique;
    
        return (
          <Card className="p-4 space-y-3">
            <h3 className="text-lg font-semibold">Transport &amp; Logistique</h3>
    
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm mt-4">
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
                <div>{formatMoney(t.amount)} {request?.general?.currency}</div>
              </div>
              <div>
                <div className="font-bold">Categorie</div>
                <div>{getRequestCategorieById(tt, type, t.categorie)} </div>
              </div>
            </div>
    
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mt-4">
              <div>
                <div className="font-bold mb-1">From</div>
                <div>Region: {getRegionsById(t.From?.region).label}</div>
                <div>City: {t.From?.city}</div>
                <div>Street: {t.From?.street || '-'}</div>
              </div>
              <div>
                <div className="font-bold mb-1">To</div>
                <div>Region: {getRegionsById(t.To?.region).label}</div>
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
              <div className="space-y-2 mt-4">
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

    const renderMainSection = () => {
        switch (request.general?.type_request) {
            case "bill": return renderBill();
            case "capex": return renderCapex();
            case "telecom": return renderTelecom();
            case "opex": return renderOpex();
            case "lease_payment": return renderLeasePayment();
            case "locomotif": return renderLocomotif();
            case "transport_logistique" : return renderTransport(t);
            default:
                return <Card className="p-4"><p className="text-sm text-muted-foreground">No specific section.</p></Card>;
        }
    };

    return (
        <div>
            <div className="w-full flex justify-end mb-4 pr-4"  >
                <Button loading={pdf} variant="solid" className=" ml-4" icon={<BiPrinter />} onClick={() => {
                    print()
                }}>
                </Button>
            </div>
            <div ref={contentRef} className="space-y-4 p-4">
                {/* General Info */}
                <Card className="p-4 space-y-2">
                    <h2 className="text-xl font-semibold">Request Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div><b>Request Type:</b> {request.general?.type_request}</div>
                        <div><b>Payment Method:</b> {request.general?.paymentMethod}</div>
                        <div><b>Currency:</b> {request.general?.currency}</div>
                        <div><b>Beneficiary:</b> {request.general?.beneficiaryName || '-'}</div>
                        <div><b>Created at:</b> {formatDate(request.createdAt)}</div>
                    </div>
                </Card>
                {renderBankInfo()}
                {renderMainSection()}
                {renderSignatures()}
            </div>
        </div>
    );
};

export default PrintRequest;
