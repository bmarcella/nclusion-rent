/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Input, Select, Button, Card, Checkbox } from '@/components/ui';
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Separator } from '@radix-ui/react-select';
import React, { useEffect, useState } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';
import { CapexTypeEnum, CurrencyEnum, DocumentTypeEnum, LocomotifSpentEnum, LocomotifTypeEnum, MoneyRequest, ProviderTelecomEnum, RenovationTypeEnum, TypePaymentEnum } from './SchemaRequest';
import { useSessionUser } from '@/store/authStore';
import { manageAuth } from '@/constants/roles.constant';
import { BankDoc, getLandlordDoc, Landlord } from '@/services/Landlord';
import { Proprio } from '@/views/Entity';
import { convertToSelectOptionsProprio } from '@/views/report/components/ReportTypeFilter';
import { Query, DocumentData, CollectionReference, query, where, getDocs, orderBy, getDoc } from 'firebase/firestore';
import { Regions } from '@/views/Entity/Regions';
import { convertStringToSelectOptions } from '@/views/bank/add/components/InfoBank';
import { getBankImages } from '@/services/firebase/BankService';
// ----------------------
// UI helpers
// ----------------------



export function FieldLeft({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center py-1">
      <label className="col-span-4 text-sm font-medium">{label}</label>
      <div className="col-span-8">
        {children}
        </div>
    </div>
  );
}

type ErrorMap = {
  key: string;
  data : any;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
  errors?: ErrorMap;
};

export function Field({ label, children, errors }: FieldProps) {
  const errorKey = errors?.key;
  const error = errorKey ? errors?.data?.[errorKey] : undefined;
  return (
    <div className="flex flex-col gap-1 py-1">
      <label className="text-sm font-medium">{label}</label>

      <div>{children}</div>

      {error?.message && (
        <span className="text-sm text-red-500">
          {error.message}
        </span>
      )}
    </div>
  );
}


export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
             <Card className="shadow-sm rounded-2xl">
                <h5 className="text-lg" >{ title }</h5>
                <div className="space-y-3">
                   {children}
                </div>
            </Card>
  );
}

// ----------------------
// Dynamic subsections
// ----------------------


export function GeneralFields( {  t, newRegionSet } : any) {

  const { control, register, watch, setValue, clearErrors, trigger,  formState: { errors } } = useFormContextTyped();
  const [regions, setRegions] = useState([]) as any;
  const [roles, setRoles] = useState([]) as any;
  const { userId, authority, proprio } = useSessionUser((state) => state.user);
  const [managers, setManagers] = useState([]) as any;
  const [loading, setLoading] = useState(false) as any;
  const paymentMethodOpts = [
      { value: 'bank_transfer', label: t('request.general.bank_transfer') },
      { value: 'cash', label: t('request.general.cash') },
      { value: 'check', label: t('request.general.check') }
  ] as any;
  const typePaymentOps = TypePaymentEnum.options.map((o) => {
    return { value: o, label: o } as any;
  })

  const currencyOps = CurrencyEnum.options.map((o) => {
    return { value: o, label: o } as any;
  })
  useEffect(() => {
      if (!authority || authority.length === 0) return;
      const auth = authority[0];
      const manage = async () => {
        const { regions, roles } = await manageAuth(auth, proprio, t);
        setRegions(regions);  
        setRoles(roles);
        setValue("general.id_region_user", regions?.[0]?.value )
      };
      manage();
    }, [authority, proprio, t]);

const paymentMethod = watch("general.paymentMethod");
const sregion = watch("general.id_region_user");
const other = watch("general.is_for_other");

 const fetchManager = async () => {
      if (!sregion) return;
      setLoading(true);
      try {
        const baseQuery: Query<DocumentData> = Landlord as CollectionReference<DocumentData>;
        const q: Query<DocumentData> = query(baseQuery, orderBy('fullName'), where("regions", 'array-contains-any', [sregion]),
          where('type_person', 'in', ['super_manager', 'manager', 'assist_manager', "assist_coordonator", "coordonator"]));
        const snapshot = await getDocs(q);
        const landlords: Proprio[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Proprio[];
        const a = convertToSelectOptionsProprio(landlords);
        setManagers(a);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error('Error fetching page:', error);
      }
  
    };

  useEffect(() => {
    const manage = async () => {
      if(other) await fetchManager();
    };
    newRegionSet(sregion)
    manage();
  }, [sregion, other]);





  return (
    <>
     <Section title="Géneral">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Région" errors={ 
          { key: "id_region_user",
            data: errors.general }
        } >
                <Controller
                  control={control}
                  name="general.id_region_user"
                  render={({ field }) => (
                    <Select  defaultValue={field.value} options={regions} onChange={(option) => field.onChange(option?.value)}>
                    </Select>
                  )}
                />
        </Field>  
        
        <Field
          label="Methode de Payment"
          errors={{
            key: "paymentMethod",
            data: errors.general,
          }}
        >
          <Controller
            control={control}
            name="general.paymentMethod"
            render={({ field }) => (
              <Select
                defaultValue={field.value}
                options={paymentMethodOpts}
                onChange={(option) => { 
                    if(option?.value !="bank_transfer") {
                       clearErrors("BankInfo");
                    }
                   field.onChange(option?.value)
                 } 
                }
              />
            )}
          />
        </Field>

        <Field
          label="Type de Payment"
          errors={{
            key: "typePayment",
            data: errors.general,
          }}
        >
          <Controller
            control={control}
            name="general.typePayment"
            render={({ field }) => (
              <Select
                defaultValue={field.value}
                options={typePaymentOps}
                onChange={(option) => field.onChange(option?.value)}
              />
            )}
          />
        </Field>

        <Field
          label="Devise"
          errors={{
            key: "currency",
            data: errors.general,
          }}
        >
          <Controller
            control={control}
            name="general.currency"
            render={({ field }) => (
              <Select
                defaultValue={field.value}
                options={currencyOps}
                onChange={(option) => field.onChange(option?.value)}
              />
            )}
          />
        </Field>

        <Field
          label="Beneficiary name"
          errors={{
            key: "beneficiaryName",
            data: errors.general,
          }}
        >
          <Input {...register("general.beneficiaryName")} />
        </Field>

        <Field
          label="Pour quelqu’un d’autre ?"
          errors={{
            key: "is_for_other",
            data: errors.general,
          }}
        >
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="general.is_for_other"
              render={({ field }) => (
                <Checkbox checked={!!field.value} onChange={field.onChange} />
              )}
            />
            <span className="text-sm text-muted-foreground">Yes</span>
          </div>
        </Field>

        {other && (
          <Field
            label="Choisissez la personne pour qui tu fais la demande ?"
            errors={{
              key: "on_behalf_user_id",
              data: errors.general,
            }}
          >
            <Controller
              control={control}
              name="general.on_behalf_user_id"
              render={({ field }) => (
                <Select
                  isLoading={loading}
                  defaultValue={field.value}
                  options={managers}
                  onChange={(option) => field.onChange(option?.value)}
                />
              )}
            />
          </Field>
        )}
            
    
       </div>
  
                                                
    </Section>
      {errors.BankInfo?.BankName && (
        <p className="text-red-500 text-xs mt-4 mb-4">
          {errors.BankInfo.BankName.message}
        </p>
       )}
      {paymentMethod == "bank_transfer" && <BankInfoFields />}
    </>
   
  );
}

export function BillFields( {  t } : any) {
  const { register } = useFormContextTyped();
  return (
    <Section title="Bill">
      <Field label="Amount"><Input type="number" step="0.01" {...register("bill.price", { valueAsNumber: true })} /></Field>
      <Field label="Description"><Input textArea {...register("bill.description")} /></Field>
      <Field label="Target date"><Input type="date" {...register("bill.target_date", { valueAsDate: true })} /></Field>
    </Section>
  );
}

export function CapexFields({  t } : any) {
  const { control, register } = useFormContextTyped();
  return (
    <Section title="Capex">
      <Field label="Type">
        <Controller
          control={control}
          name="capex.type"
          render={({ field }) => (
            <Select onChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                {CapexTypeEnum.options.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <Field label="Quantity"><Input type="number" {...register("capex.quantity", { valueAsNumber: true })} /></Field>
      <Field label="Unit price"><Input type="number" step="0.01" {...register("capex.price", { valueAsNumber: true })} /></Field>
      <Field label="Provider"><Input {...register("capex.provider")} /></Field>
      <Field label="Beneficiary"><Input {...register("capex.beneficiary")} /></Field>
      <Field label="Target date"><Input type="date" {...register("capex.target_date", { valueAsDate: true })} /></Field>
      <Field label="Description">
        <textarea {...register("capex.decripstion")} />
      </Field>
    </Section>
  );
}

export function LocomotifFields( {  t } : any ) {
  const { control, register } = useFormContextTyped();
  return (
    <Section title="Locomotif">
      <Field label="Spent type">
        <Controller
          control={control}
          name="locomotif.spent_type"
          render={({ field }) => (
            <Select onChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {LocomotifSpentEnum.options.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <Field label="Type">
        <Controller
          control={control}
          name="locomotif.type_locomotif"
          render={({ field }) => (
            <Select onChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {LocomotifTypeEnum.options.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <Field label="Plaque"><Input {...register("locomotif.plaque")} /></Field>
      <Field label="Provider"><Input {...register("locomotif.provider")} /></Field>
      <Field label="Price"><Input type="number" step="0.01" {...register("locomotif.price", { valueAsNumber: true })} /></Field>
      <Field label="Description">
          <Input placeholder="Text area example" {...register("locomotif.description")} textArea />
        </Field>
    </Section>
  );
}

export function BankInfoFields({  t } : any) {
  const { register } = useFormContextTyped();
  return (
    <Section title="Information Bancaire">
      <Field label="Bank name"><Input {...register("BankInfo.BankName")} /></Field>
      <Field label="Account name"><Input {...register("BankInfo.AccountName")} /></Field>
      <Field label="Account number"><Input type="number" {...register("BankInfo.AccountNumber", { valueAsNumber: true })} /></Field>
      <Field label="SWIFT"><Input {...register("BankInfo.SWIFT")} /></Field>
    </Section>
  );
}

export function DocumentsFields({  t } : any) {
  const { control } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "documents", control });
  return (
    <Section title="Documents">
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <div key={f.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`documents.${idx}.type` as const}
              render={({ field }) => (
                <Select onChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="w-64"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    {DocumentTypeEnum.options.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <Button type="button" variant="default" onClick={() => remove(idx)}>Remove</Button>
          </div>
        ))}
        <Button type="button" onClick={() => append({ type: undefined as any })}>Add document</Button>
      </div>
    </Section>
  );
}

export function TelecomFields({  t } : any) {
  const { control, register } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "telecom.plans", control });
  return (
    <Section title="Telecom">
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <Card key={f.id} className="border p-3">
            <div className="flex justify-between items-center">
              <div className="font-medium">Plan #{idx + 1}</div>
              <Button type="button" variant="default" onClick={() => remove(idx)}>Remove</Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Input placeholder="Beneficiary" {...register(`telecom.plans.${idx}.beneficiary` as const)} />
              <Controller
                control={control}
                name={`telecom.plans.${idx}.provider` as const}
                render={({ field }) => (
                  <Select onChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Provider" /></SelectTrigger>
                    <SelectContent>
                      {ProviderTelecomEnum.options.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input placeholder="Plan type" {...register(`telecom.plans.${idx}.plan_type` as const)} />
              <Input type="date" {...register(`telecom.plans.${idx}.start_date` as const, { valueAsDate: true })} />
              <Input type="date" {...register(`telecom.plans.${idx}.end_date` as const, { valueAsDate: true })} />
              <Input type="number" step="0.01" placeholder="Price" {...register(`telecom.plans.${idx}.price` as const, { valueAsNumber: true })} />
              <Input placeholder="ID card" {...register(`telecom.plans.${idx}.id_card` as const)} />
            </div>
          </Card>
        ))}
        <Button type="button" onClick={() => append({} as any)}>Add plan</Button>
      </div>
      <Separator className="my-4" />
      <Field label="Description"><textarea {...register("telecom.description")} /></Field>
      <Field label="Total price"><Input type="number" step="0.01" {...register("telecom.total_price", { valueAsNumber: true })} /></Field>
    </Section>
  );
}

export function OpexFields({  t, categories } : any) {
  const { control, register, watch } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "opex.items", control });
  const cat = watch("opex.categorie");
  return (
    <Section title="Opex (Achat de Matériel / Fournitures)">
      <Field label="Catégorie">
        <Controller
          control={control}
          name="opex.categorie"
          render={({ field }) => (
            <Select onChange={field.onChange} value={field.value} options={categories}/>
          )}
        />
      </Field>
      {cat === "autre" && (
        <Field label="Autre catégorie"><Input {...register("opex.other_categorie")} /></Field>
      )}
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-4" placeholder="Item name" {...register(`opex.items.${idx}.name` as const)} />
            <Input className="col-span-2" type="number" placeholder="Qty" {...register(`opex.items.${idx}.quantity` as const, { valueAsNumber: true })} />
            <Input className="col-span-3" type="number" step="0.01" placeholder="Unit price" {...register(`opex.items.${idx}.unit_price` as const, { valueAsNumber: true })} />
            <Input className="col-span-3" type="number" step="0.01" placeholder="Total price" {...register(`opex.items.${idx}.total_price` as const, { valueAsNumber: true })} />
            <div className="col-span-12 text-right">
              <Button type="button" variant="default" onClick={() => remove(idx)}>Remove</Button>
            </div>
          </div>
        ))}
        <Button type="button" onClick={() => append({} as any)}>Add item</Button>
      </div>
      <Field label="Amount"><Input type="number" step="0.01" {...register("opex.amount", { valueAsNumber: true })} /></Field>
      <Field label="Description"><textarea {...register("opex.description")} /></Field>
      <Field label="Master Bank ID (optional)"><Input {...register("opex.masterbankId")} /></Field>
    </Section>
  );
}

export function TransportFields({  t, region } : any) {
  const { control, register, watch, setValue,  clearErrors, trigger , formState: { errors } } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "transport_logistique.items", control });
  const [cities, setCities] = useState([]) as any;
  const [to_cities, setToCities] = useState([]) as any;
  const sregion = watch("transport_logistique.From.region");
  const tsregion = watch("transport_logistique.To.region");


    useEffect(() => {
            const region = Regions.find(option => Number(option.value) === Number(sregion)) || null;
            if (region) {
              setCities(convertStringToSelectOptions(region.cities || []));
            }
        } , [sregion]);

         useEffect(() => {
            const region = Regions.find(option => Number(option.value) === Number(tsregion)) || null;
            if (region) {
              setToCities(convertStringToSelectOptions(region.cities || []));
            }
        } , [tsregion]);
 useEffect(() => {
 //  console.log("Region changed:", region);
  if (!region) return;
  setValue("transport_logistique.From.region", region);
}, [region]);


  return (
  <Section title="Transport & Logistique">
  <Field
    label="Transport date"
    errors={{
      key: "transport_date",
      data: errors.transport_logistique,
    }}
  >
    <Input
      type="date"
      {...register("transport_logistique.transport_date", {
        valueAsDate: true,
      })}
    />
  </Field>

  <Card className="p-3">
    <div className="font-medium mb-2">From</div>
    <div className="grid grid-cols-3 gap-3">
      <Field
        label="Région"
        errors={{
          key: "region",
          data: errors.transport_logistique?.From,
        }}
      >
            <Controller
        control={control}
        name="transport_logistique.From.region"
        render={({ field }) => {
        const selectedOption = Regions.find(o => o.value === field.value) ?? null;
        return (
          <Select
            value={selectedOption}                       // 👈 full option
            options={Regions}
            onChange={(option) => field.onChange(option?.value)}
          />
        );
        }}
        />
      </Field>

      <Field
        label="Ville"
        errors={{
          key: "city",
          data: errors.transport_logistique?.From,
        }}
      >
        <Controller
          control={control}
          name="transport_logistique.From.city"
          render={({ field }) => (
            <Select
              defaultValue={field.value}
              options={cities}
              onChange={(option) => field.onChange(option?.value)}
            />
          )}
        />
      </Field>

      <Field
        label="Rue"
        errors={{
          key: "street",
          data: errors.transport_logistique?.From,
        }}
      >
        <Input
          placeholder="Street"
          {...register("transport_logistique.From.street")}
        />
      </Field>
    </div>
  </Card>

  <Card className="p-3">
    <div className="font-medium mb-2">To</div>
    <div className="grid grid-cols-3 gap-3">
      <Field
        label="Région"
        errors={{
          key: "region",
          data: errors.transport_logistique?.To,
        }}
      >
        <Controller
          control={control}
          name="transport_logistique.To.region"
          render={({ field }) => (
            <Select
              defaultValue={field.value}
              options={Regions}
              onChange={(option) => field.onChange(option?.value)}
            />
          )}
        />
      </Field>

      <Field
        label="Ville"
        errors={{
          key: "city",
          data: errors.transport_logistique?.To,
        }}
      >
        <Controller
          control={control}
          name="transport_logistique.To.city"
          render={({ field }) => (
            <Select
              defaultValue={field.value}
              options={to_cities}
              onChange={(option) => field.onChange(option?.value)}
            />
          )}
        />
      </Field>

      <Field
        label="Rue"
        errors={{
          key: "street",
          data: errors.transport_logistique?.To,
        }}
      >
        <Input
          placeholder="Street"
          {...register("transport_logistique.To.street")}
        />
      </Field>
    </div>
  </Card>

  <Field
    label="Purpose"
    errors={{
      key: "purpose",
      data: errors.transport_logistique,
    }}
  >
    <Input textArea  {...register("transport_logistique.purpose")} />
  </Field>


  <Field
    label="Done by an employee"
    errors={{
      key: "donebyAnEmployee",
      data: errors.transport_logistique,
    }}
  >
    <div className="flex items-center gap-2">
      <Controller
        control={control}
        name="transport_logistique.donebyAnEmployee"
        render={({ field }) => (
          <Checkbox checked={!!field.value} onChange={field.onChange} />
        )}
      />
      <span className="text-sm text-muted-foreground">Yes</span>
    </div>
  </Field>

  <Field
    label="Amount"
    errors={{
      key: "amount",
      data: errors.transport_logistique,
    }}
  >
    <Input
      type="number"
      step="0.01"
      {...register("transport_logistique.amount", {
        valueAsNumber: true,
      })}
    />
  </Field>

  <div className="space-y-3">
     {errors?.transport_logistique?.items && (
        <span className="text-sm text-red-500">
          {errors.transport_logistique.items.message}
        </span>
      )}
    <div className="font-medium">Items</div>
    {fields.map((f, idx) => (
      <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
        <Input
          className="col-span-8"
          placeholder="Item name"
          {...register(
            `transport_logistique.items.${idx}.name` as const
          )}
        />
        <Input
          className="col-span-3"
          type="number"
          placeholder="Qty"
          {...register(
            `transport_logistique.items.${idx}.quantity` as const,
            { valueAsNumber: true }
          )}
        />
        <div className="col-span-1 text-right">
          <Button
            type="button"
            variant="default"
            onClick={() => remove(idx)}
          >
            ✕
          </Button>
        </div>
      </div>
    ))}
     <Button type="button" onClick={() => append({} as any)}>
      Add item
    </Button>
  </div>
</Section>

  );
}

export function BankRenovationFields({  t } : any) {
  const { control, register } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "bank_renovation.Bank", control });
  return (
    <Section title="Bank Renovation">
      <div className="space-y-2">
        {fields.map((f, idx) => (
          <div key={f.id} className="grid grid-cols-12 gap-2 items-center">
            <Input className="col-span-7" placeholder="Bank name" {...register(`bank_renovation.Bank.${idx}.bankName` as const)} />
            <Input className="col-span-4" type="number" step="0.01" placeholder="Amount" {...register(`bank_renovation.Bank.${idx}.amount` as const, { valueAsNumber: true })} />
            <div className="col-span-1 text-right">
              <Button type="button" variant="default" onClick={() => remove(idx)}>✕</Button>
            </div>
          </div>
        ))}
        <Button type="button" onClick={() => append({} as any)}>Add bank</Button>
      </div>
      <Field label="Type of renovation">
        <Controller
          control={control}
          name="bank_renovation.type_renovation"
          render={({ field }) => (
            <Select onChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                {RenovationTypeEnum.options.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date"><Input type="date" {...register("bank_renovation.start_date", { valueAsDate: true })} /></Field>
        <Field label="End date"><Input type="date" {...register("bank_renovation.end_date", { valueAsDate: true })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Vendor ID"><Input {...register("bank_renovation.vendor_id")} /></Field>
        <Field label="Vendor name"><Input {...register("bank_renovation.vendor_name")} /></Field>
      </div>
      <Field label="Total amount"><Input type="number" step="0.01" {...register("bank_renovation.total_amount", { valueAsNumber: true })} /></Field>
      <Field label="Contract ID"><Input {...register("bank_renovation.contract_id")} /></Field>
      <Field label="Description"><textarea {...register("bank_renovation.description")} /></Field>
    </Section>
  );
}

export function LeasePaymentFields({  t } : any) {
  const { register, watch, control, setValue, formState: { errors }  } = useFormContextTyped();
  const [cbank, setCBank] = useState() as any;
  const [banks, setBanks] = useState([]) as any;
  const sregion = watch('general.id_region_user');
  const fetchBanks = async () => {
      if (!sregion) return;
      const q: Query<DocumentData> = query(BankDoc, orderBy("createdAt", "desc"),
        where("id_region", "==", sregion),
        where("approve", "==", true),
        where("step", "in", ["bankSteps.needContract", "bankSteps.needContract"]),
      );
      const snapshot = await getDocs(q);
      const newBanks = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const landlordId = data.landlord;
          let landlord = null;
          if (landlordId) {
            const landlordSnap = await getDoc(getLandlordDoc(landlordId));
            landlord = landlordSnap.exists() ? landlordSnap.data() : null;
          }
          const images = await getBankImages(docSnap.id);
          return { id: docSnap.id, ...data, landlord, images };
        })
      );
      // Instead of replacing, accumulate
      setBanks(newBanks);
    };

  const FrenchDate = (dateString: any, y = 0, format?: boolean) => {
    const date = new Date(dateString);

    // Add y years if y > 0
    if (y > 0) {
      date.setFullYear(date.getFullYear() + y);
    }
    if (format) {
        const formatted = new Intl.DateTimeFormat('fr-FR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date);
        return formatted;
     }
     return date;
  };

  const formatForInput = (date: Date | string | null) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
  };

  const addYears = (date: Date, years: number) => {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
  };

  useEffect(() => {
    if (!sregion) return;
    fetchBanks();
  }, [sregion]);

    useEffect(() => {
      if(!cbank) return;
    setValue("lease_payment.id_landlord", cbank.landlord.id);
    setValue("lease_payment.landlordName", cbank?.landlord?.fullName);
    setValue("lease_payment.bankName", cbank?.bankName);
    setValue("lease_payment.create_by", cbank.createdBy);
    const formatted = formatForInput(cbank.date);
    const end = formatForInput(addYears(cbank.date, cbank.yearCount)); 
    setValue("lease_payment.start_date", formatted as any);
    setValue("lease_payment.end_date", end as any);
    setValue("lease_payment.rentCost", cbank.final_rentCost ?? cbank.rentCost );
    setValue("lease_payment.yearNumber", cbank.yearCount as any);
    setValue("lease_payment.whoApproveTheBank", cbank.finalDecision.createdBy);
     setValue('lease_payment.description', ` Location pour une nouvelle bank : ${cbank.bankName} 
        \n Nom du proprietaire :  ${cbank?.landlord?.fullName || ""} 
        \n Adresse : ${cbank.city || ''} ${cbank.address || ''}
        \n Montant:  HTG ${cbank.final_rentCost || 0}
        \n Durée : ${cbank.yearCount}
        \n Date de debut: ${FrenchDate(cbank.date)}
        \n Date de fin: ${FrenchDate(cbank.date, cbank.yearCount)}
        \n Description : ${cbank.description || 'Pas de description'} 
        `);
    console.log(cbank);
  }, [cbank]);
  console.log(errors);
  return (
    <Section title="Lease Payment">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Bank" errors={ 
          { key: "id_bank",
            data: errors.lease_payment }
        }>
          {/* <Input {...register("lease_payment.id_bank")} /> */}

           <Controller name="lease_payment.id_bank" control={control} render={({ field }) =>
                  <Select
                    placeholder="choissir une bank"
                    options={banks.map((bank: any) => ({ value: bank.id, label: bank.bankName }))}
                    onChange={(option: any) => {
                      setCBank(banks.find((b: any) => b.id === option.value));
                      field.onChange(option.value);
                    }}
                  />
                } />
          </Field>
        <Field label="Nom du proprietaire"><Input  disabled={true} {...register("lease_payment.landlordName")} /></Field>

        <Field label="Start date"
        errors={ 
          { key: "start_date",
            data: errors.lease_payment }
        }
        ><Input  type="date" {...register("lease_payment.start_date")} /></Field>
        <Field label="End date"
        errors={ 
          { key: "end_date",
            data: errors.lease_payment }
        }
        ><Input  type="date" {...register("lease_payment.end_date")} /></Field>

        <Field label="Years" 
         errors={ 
          { key: "yearNumber",
            data: errors.lease_payment }
        }
        ><Input type="number" {...register("lease_payment.yearNumber", { valueAsNumber: true })} /></Field>
        <Field label="Rent cost"><Input disabled={true} type="number" step="1000" {...register("lease_payment.rentCost", { valueAsNumber: true })} /></Field>
        {/* <Field label="Who approves the bank"><Input disabled={true} {...register("lease_payment.whoApproveTheBank")} /></Field>
        <Field label="Created by"><Input disabled={true} {...register("lease_payment.create_by")} /></Field> */}
      </div>
      <Field label="Renovation by the landlord">
        <Controller
          name="lease_payment.renovationByTheLandlord"
          render={({ field }) => (
            <div className="flex items-center gap-2"><Checkbox checked={!!field.value} onChange={field.onChange} /> <span className="text-sm text-muted-foreground">Yes</span></div>
          )}
        />
      </Field>
      <Field label="Description"><Input textArea {...register("lease_payment.description")} /></Field>
    </Section>
  );
}


export function useFormContextTyped() {
  return useFormContext<MoneyRequest>();
}

