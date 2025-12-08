/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Select, Button, Card, Checkbox, Spinner } from '@/components/ui';
import { SelectTrigger, SelectValue, SelectContent, SelectItem, Separator } from '@radix-ui/react-select';
import React, { useEffect, useMemo, useState } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { CurrencyEnum, DocumentTypeEnum, LocomotifSpentEnum, LocomotifTypeEnum, MoneyRequest, ProviderTelecomEnum, RenovationTypeEnum, TypePaymentEnum } from './SchemaRequest';
import { useSessionUser } from '@/store/authStore';
import { manageAuth } from '@/constants/roles.constant';
import { BankDoc, contractsDoc, ExpenseRequestDoc, getBankDoc, getLandlordDoc, Landlord, LandlordDoc } from '@/services/Landlord';
import { Proprio } from '@/views/Entity';
import { convertToSelectOptionsProprio } from '@/views/report/components/ReportTypeFilter';
import { Query, DocumentData, CollectionReference, query, where, getDocs, orderBy, getDoc, or } from 'firebase/firestore';
import { Regions } from '@/views/Entity/Regions';
import { convertStringToSelectOptions } from '@/views/bank/add/components/InfoBank';
import { getBankImages, getLordImages } from '@/services/firebase/BankService';
import { IRequest } from './IRequest';
import { HiChevronDown } from 'react-icons/hi';
import GoogleMapApp from '@/views/bank/show/Map';
import ImageGallery, { BankImage } from '@/views/bank/show/components/ImageGallery';
import ImageLordComp, { LordImage } from '@/views/bank/show/components/ImageLord';
import BankInfo from '@/views/bank/show/components/BankInfo';
import CommentsBank from '@/views/bank/add/components/CommentsBank';
import ContractDeService from '@/views/vendor/components/ContractDeService';
// ----------------------
// UI helpers
// ----------------------

const formatForInput = (date: Date | string | null) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toISOString().split("T")[0];
};


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
  data: any;
};

type FieldProps = {
  label: string;
  children: React.ReactNode;
  errors?: ErrorMap;
};

type FieldPropsError = {
  errors: ErrorMap;
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

export function Error({ errors }: FieldPropsError) {
  const errorKey = errors?.key;
  const error = errorKey ? errors?.data?.[errorKey] : undefined;
  return (
    <div className="flex flex-col gap-1 py-1">
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
      <h5 className="text-lg" >{title}</h5>
      <div className="space-y-3">
        {children}
      </div>
    </Card>
  );
}


export function CollapsSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = React.useState(defaultOpen);

  const toggle = () => setOpen((v) => !v);

  return (
    <Card className="shadow-sm rounded-2xl p-4">
      {/* Header toggle */}
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between gap-3"
        aria-expanded={open}
      >
        <h5 className="text-lg font-medium text-left">{title}</h5>
        <HiChevronDown
          className={`h-5 w-5 transition-transform duration-200 ${open ? "rotate-180" : "rotate-0"
            }`}
        />
      </button>

      {/* Content */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${open ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
          }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3">{children}</div>

          {/* Footer collapse button (only when open) */}
          {open && (
            <div className="mt-4 pt-3 border-t  border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={toggle}
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                <HiChevronDown className="h-4 w-4 rotate-180" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}


// ----------------------
// Dynamic subsections
// ----------------------


export function GeneralFields({ t, newRegionSet }: any) {

  const { control, register, watch, setValue, clearErrors, trigger, formState: { errors } } = useFormContextTyped();
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
      setValue("general.id_region_user", regions?.[0]?.value)

    };
    manage();
  }, [authority, proprio, t]);

  const flows = useMemo(()=> {
    return [ 
      {
       value: 1,
       label: 'complet'
     },
     {
       value: 2,
       label: 'coordonateur'
     },
     {
       value: 3,
       label: 'comptable'
     } 
  ]
  }, []);

   useEffect(() => {
     if (!flows || flows.length==0) return;
     setValue("general.approvalFlow", flows[0]?.value || null)
  }, [flows]);

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
      if (other) await fetchManager();
    };
    newRegionSet(sregion)
    manage();
  }, [sregion, other]);
  console.log(errors)
  return (
    <>
      <Section title="Géneral">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {regions.length > 1 && regions.length != 0 && <Field label="Région" errors={
            {
              key: "id_region_user",
              data: errors.general
            }
          } >
            <Controller
              control={control}
              name="general.id_region_user"
              render={({ field }) => (
                <Select options={regions} value={regions.find((r: any) => r.value == field.value)} onChange={(option) => field.onChange(Number(option?.value))}>
                </Select>
              )}
            />
          </Field>}


          {regions.length == 1 && <Field label='Region'>
            <Input value={regions[0].capital} disabled></Input>
          </Field>}

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
                    if (option?.value != "bank_transfer") {
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
              label="Choisissez la personne  ?"
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
                    options={managers}
                    onChange={(option) => field.onChange(option?.value)}
                  />
                )}
              />
            </Field>
          )}

          { flows && flows.length> 0 && <Field
            label="Envoyer a"
            errors={{
              key: "approvalFlow",
              data: errors.general,
            }}
          >
            <Controller
              control={control}
              name="general.approvalFlow"
              render={({ field }) => (
                <Select
                  defaultValue={field.value}
                  options={flows}
                  onChange={(option) => {
                    field.onChange(Number(option?.value))
                  }
                  }
                />
              )}
            />
          </Field>}


        </div>


      </Section >
      {
        errors.BankInfo?.BankName && (
          <p className="text-red-500 text-xs mt-4 mb-4">
            {errors.BankInfo.BankName.message}
          </p>
        )
      }
      {paymentMethod == "bank_transfer" && <BankInfoFields />}
    </>

  );
}

export function BillFields({ t, categories }: any) {
  const { register, control } = useFormContextTyped();
  const [type, setType] = useState([]);
  return (
    <Section title="Bill & Autres">
      <Field label="Categorie">
        <Controller
          control={control}
          name="bill.categorie"
          render={({ field }) => (
            <Select
              onChange={(option) => {
                setType(option?.type)
                field.onChange(Number(option?.value))
              }
              }
              options={categories}
            />
          )}
        />
      </Field>
      {type && type.length > 0 && < Field label="Type">
        <Controller
          control={control}
          name="bill.type"
          render={({ field }) => (
            <Select
              onChange={(option) => {
                field.onChange(option?.value)
              }
              }
              options={type.map((p) => ({ label: p, value: p }))}
            />
          )}
        />
      </Field>}
      <Field label="Amount"><Input type="number" step="0.01" {...register("bill.price", { valueAsNumber: true })} /></Field>
      <Field label="Description"><Input textArea {...register("bill.description")} /></Field>
      <Field label="Target date"><Input type="date" {...register("bill.target_date", { valueAsDate: true })} /></Field>
    </Section>
  );
}

export function CapexFields({ t, categories }: any) {
  const { control, register, setValue } = useFormContextTyped();
  const [type, setType] = useState([]);
  const unit_price = useWatch({ control, name: "capex.unit_price" });
  const qt = useWatch({ control, name: "capex.quantity" });
  useEffect(() => {
    const total = unit_price * qt;

    setValue("capex.price", total, {
      shouldDirty: true,
      shouldValidate: false,
      shouldTouch: false,
    });
  }, [unit_price, qt, setValue]);
  return (
    <Section title="Capex">
      <Field label="Categorie">
        <Controller
          control={control}
          name="capex.categorie"
          render={({ field }) => (
            <Select
              onChange={(option) => {
                setType(option?.type)
                field.onChange(Number(option?.value))
              }
              }
              options={categories}
            />
          )}
        />
      </Field>
      {type && type.length > 0 && < Field label="Type">
        <Controller
          control={control}
          name="capex.type"
          render={({ field }) => (
            <Select
              onChange={(option) => {
                field.onChange(option?.value)
              }
              }
              options={type.map((p) => ({ label: p, value: p }))}
            />
          )}
        />
      </Field>}
      <Field label="Quantity"><Input type="number" {...register("capex.quantity", { valueAsNumber: true })} /></Field>
      <Field label="Prix unitiare"><Input type="number" step="0.01" {...register("capex.unit_price", { valueAsNumber: true })} /></Field>
      <Field label="Prix Total"><Input type="number" readOnly step="0.01" {...register("capex.price", { valueAsNumber: true })} /></Field>
      <Field label="Fournisseur"><Input {...register("capex.provider")} /></Field>
      <Field label="Target date"><Input type="date" {...register("capex.target_date", { valueAsDate: true })} /></Field>
      <Field label="Description">
        <Input textArea {...register("capex.decripstion")} />
      </Field>
    </Section >
  );
}

export function LocomotifFields({ t, categories }: any) {
  const { control, register } = useFormContextTyped();
  return (
    <Section title="Locomotif">
      <Field label="Categorie">
        <Controller
          control={control}
          name="locomotif.categorie"
          render={({ field }) => (
            <Select onChange={(opt) => field.onChange(String(opt?.value))} options={categories}>
            </Select>
          )}
        />
      </Field>
      <Field label="Type">
        <Controller
          control={control}
          name="locomotif.type_locomotif"
          render={({ field }) => (
            <Select onChange={(opt) => field.onChange(String(opt?.value))} options={LocomotifTypeEnum.options.map((p) => ({ label: p, value: p }))}>
            </Select>
          )}
        />
      </Field>
      <Field label="Plaque"><Input {...register("locomotif.plaque")} /></Field>
      <Field label="Founisseur/Vendeur"><Input {...register("locomotif.provider")} /></Field>
      <Field label="Price"><Input type="number" step="0.01" {...register("locomotif.price", { valueAsNumber: true })} /></Field>
      <Field label="Description">
        <Input placeholder="Text area example" {...register("locomotif.description")} textArea />
      </Field>
    </Section>
  );
}

export function BankInfoFields({ t }: any) {
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

export function DocumentsFields({ t }: any) {
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

export function TelecomFields({ t, categories }: any) {
  const { control, register, setValue, formState: { errors } } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "telecom.plans", control });
  const plans = useWatch({ control, name: "telecom.plans" }) || [];

  const cardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const pendingScrollRef = React.useRef(false);

  // after render, if a plan was added and we have >= 1 cards, scroll to the newest
  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;

    // start scrolling only when there are at least 2 cards
    if (fields.length < 2) return;

    const lastId = fields[fields.length - 1]?.id;
    if (!lastId) return;

    // allow refs to attach
    requestAnimationFrame(() => {
      cardRefs.current[lastId]?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [fields]);

  const handleAddPlan = () => {
    // don’t scroll for the 1st card; scroll starting when user adds the 2nd (and onwards)
    pendingScrollRef.current = true;
    append({ price: 0 } as any);
  };

  React.useEffect(() => {
    const total = (plans || []).reduce((sum: number, p: any) => {
      return sum + (Number(p?.price) || 0);
    }, 0);

    setValue("telecom.total_price", total, {
      shouldDirty: true,
      shouldValidate: false,
      shouldTouch: false,
    });
  }, [plans, setValue]);

  return (
    <Section title="Telecom">
      <Field label="Catégorie" errors={{
        key: `categorie`,
        data: errors?.telecom
      }}>
        <Controller
          control={control}
          name="telecom.categorie"
          render={({ field }) => (
            <Select
              onChange={(option) => field.onChange(Number(option?.value))}
              options={categories}
            />
          )}
        />
      </Field>
      <div className="space-y-3">
        {fields.map((f, idx) => (
          <Card key={f.id} className="border p-3" ref={(el: any) => {
            cardRefs.current[f.id] = el;
          }} >
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
                  <Select onChange={(opt) => field.onChange(String(opt?.value))} options={ProviderTelecomEnum.options.map((p) => ({ label: p, value: p }))}>
                  </Select>
                )}
              />
              <Input placeholder="Plan type" {...register(`telecom.plans.${idx}.plan_type` as const)} />
              <Input type="date" {...register(`telecom.plans.${idx}.start_date` as const, { valueAsDate: true })} />
              <Input type="date" {...register(`telecom.plans.${idx}.end_date` as const, { valueAsDate: true })} />
              <Input type="number" step="0.01" placeholder="Price" {...register(`telecom.plans.${idx}.price` as const, { valueAsNumber: true })} />
              <Input placeholder="NIF/NIN" {...register(`telecom.plans.${idx}.id_card` as const)} />
              <Error errors={{
                key: `price`,
                data: errors?.telecom?.plans?.[idx]
              }}></Error>
            </div>
          </Card>
        ))}
        <Button type="button" onClick={handleAddPlan}>Add plan</Button>
      </div>
      <Separator className="my-4" />
      <Field label="Total price">
        <Input type="number" readOnly disabled step="0.01" {...register("telecom.total_price", { valueAsNumber: true })} />
      </Field>
      <Field label="Description">
        <Input textArea {...register("telecom.description")} />
      </Field>
    </Section>
  );
}

export function OpexFields({ t, categories }: any) {

  const { control, register, watch, setValue } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "opex.items", control });

  const items = useWatch({ control, name: "opex.items" }) || [];
  const cat = watch("opex.categorie");
  useEffect(() => {
    if (!items) return;

    let totalAmount = 0;

    items.forEach((item: any, index: number) => {
      const qty = Number(item?.quantity) || 0;
      const price = Number(item?.unit_price) || 0;

      const total = qty * price;

      // update each row total_price
      setValue(`opex.items.${index}.total_price`, total, {
        shouldDirty: true,
        shouldValidate: false,
        shouldTouch: false,
      });

      totalAmount += total;
    });

    // update global amount
    setValue("opex.amount", totalAmount, { shouldValidate: true });
  }, [items]);
  // Every time the items array changes -> recalculation runs

  return (
    <Section title="Opex (Achat de Matériel / Fournitures)">
      <Field label="Catégorie">
        <Controller
          control={control}
          name="opex.categorie"
          render={({ field }) => (
            <Select
              onChange={(option) => field.onChange(Number(option?.value))}
              options={categories}
            />
          )}
        />
      </Field>

      {cat === 0 && (
        <Field label="Autre catégorie">
          <Input {...register("opex.other_categorie")} />
        </Field>
      )}

      <div className="space-y-3">
        {/* Labels row */}
        {fields.length > 0 && <div
          role="row"
          aria-label="Opex items columns"
          className="hidden md:grid grid-cols-12 gap-2 items-center text-xs font-semibold text-muted-foreground"
        >
          <div role="columnheader" className="col-span-4">Item name</div>
          <div role="columnheader" className="col-span-2">Qty</div>
          <div role="columnheader" className="col-span-2">Unit price</div>
          <div role="columnheader" className="col-span-2">Total price</div>
          <div role="columnheader" className="col-span-2 text-right">Action</div>
        </div>}

        {fields.map((f, idx) => (
          <div
            key={f.id}
            role="row"
            className="grid grid-cols-12 gap-2 items-center"
          >
            <Input
              className="col-span-4"
              placeholder="Item name"
              {...register(`opex.items.${idx}.name`)}
            />

            <Input
              className="col-span-2"
              type="number"
              placeholder="Qty"
              {...register(`opex.items.${idx}.quantity`, { valueAsNumber: true })}
            />

            <Input
              className="col-span-2"
              type="number"
              step="0.01"
              placeholder="Unit price"
              {...register(`opex.items.${idx}.unit_price`, { valueAsNumber: true })}
            />

            <Input
              className="col-span-2 bg-gray-100"
              type="number"
              placeholder="Total price"
              readOnly
              {...register(`opex.items.${idx}.total_price`, { valueAsNumber: true })}
            />

            <div role="cell" className="col-span-2 text-right">
              <Button type="button" variant="default" onClick={() => remove(idx)}>
                Remove
              </Button>
            </div>
          </div>
        ))}

        <Button type="button" onClick={() => append({ quantity: 1, unit_price: 0 })}>
          Add item
        </Button>
      </div>


      {/* amount auto-calculated */}
      <Field label="Amount">
        <Input type="number" step="0.01" readOnly {...register("opex.amount")} />
      </Field>

      <Field label="Description">
        <Input textArea {...register("opex.description")} />
      </Field>

      <Field label="Bank ID on Toussaint or AjiMobil">
        <Input {...register("opex.masterbankId")} />
      </Field>
    </Section>
  );
}

export function TransportFields({ t, region, categories }: any) {
  const { control, register, watch, setValue, clearErrors, trigger, formState: { errors } } = useFormContextTyped();
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
  }, [sregion]);

  useEffect(() => {
    const region = Regions.find(option => Number(option.value) === Number(tsregion)) || null;
    if (region) {
      setToCities(convertStringToSelectOptions(region.cities || []));
    }
  }, [tsregion]);
  useEffect(() => {
    //  console.log("Region changed:", region);
    if (!region) return;
    setValue("transport_logistique.From.region", region);
  }, [region]);


  return (
    <Section title="Transport & Logistique">
      <Field label="Catégorie"
        errors={{
          key: "categorie",
          data: errors.transport_logistique,
        }}>
        <Controller
          control={control}
          name="transport_logistique.categorie"
          render={({ field }) => (
            <Select onChange={(option) => field.onChange(Number(option?.value))} options={categories} />
          )}
        />
      </Field>
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

export function LeasePaymentFields({ t, categories }: any) {
  const { register, watch, control, setValue, formState: { errors } } = useFormContextTyped();
  const [cbank, setCBank] = useState() as any;
  const [banks, setBanks] = useState([]) as any;
  const [reqs, setReqs] = useState([]) as any;
  const [can, setCan] = useState(false) as any;
  const [loading, setLoading] = useState(false) as any;
  const sregion = watch('general.id_region_user');
  const [images, setImages] = useState<BankImage[]>([])
  const [lImages, setLImages] = useState<LordImage[]>([]);
  const { authority, userId } = useSessionUser((state) => state.user);
  const [type, setType] = useState([]);
  useEffect(() => {

    if (!cbank) return;
    getBankImages(cbank.id).then((imgs: BankImage[]) => {
      console.log("Bank Images: ", imgs);
      setImages(imgs);
    });

    getLordImages(cbank.landlord.id).then((imgs: any[]) => {
      console.log("Landlord Images: ", imgs);
      setLImages(imgs);
    });
  }, [cbank]);

  const fetchReq = async (bankId: string) => {
    if (!bankId) return;
    try {
      setCan(false);
      setLoading(true);
      const baseQuery = ExpenseRequestDoc as CollectionReference<DocumentData>;

      const q = query(
        baseQuery,
        where("lease_payment.id_bank", "==", bankId),
        where("status", "not-in", ["rejected", "cancelled"]),
        orderBy("createdAt")
      );

      const snapshot = await getDocs(q);

      const reqs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IRequest[];
      setLoading(false);
      setReqs(reqs);
      setCan(reqs.length === 0);
    } catch (error) {
      setCan(false);
      setLoading(false);
      console.error("Error fetching page:", error);
    }
  };

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
    if (!cbank) return;
    if (can) {
      setValue("lease_payment.id_landlord", cbank.landlord.id);
      setValue("lease_payment.landlordName", cbank?.landlord?.fullName);
      setValue("lease_payment.bankName", cbank?.bankName);
      setValue("lease_payment.create_by", cbank.createdBy);
      const formatted = formatForInput(cbank.date);
      const end = formatForInput(addYears(cbank.date, cbank.yearCount));
      setValue("lease_payment.start_date", formatted as any);
      setValue("lease_payment.end_date", end as any);
      setValue("lease_payment.rentCost", cbank.final_rentCost ?? cbank.rentCost);
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
    } else {
      // clear all fields
      setValue("lease_payment.id_landlord", undefined as any);
      setValue("lease_payment.landlordName", "");
      setValue("lease_payment.bankName", "");
      setValue("lease_payment.create_by", "");

      setValue("lease_payment.start_date", undefined as any);
      setValue("lease_payment.end_date", undefined as any);

      setValue("lease_payment.rentCost", null as any); // or 0
      setValue("lease_payment.yearNumber", null as any); // or undefined
      setValue("lease_payment.whoApproveTheBank", "");
      setValue("lease_payment.description", "");
    }
  }, [cbank, can]);

  return (
    <>
      <Section title="Lease Payment">
        <div className="grid grid-cols-1 gap-1">
          <Field label="Categorie">
            <Controller
              control={control}
              name="lease_payment.categorie"
              render={({ field }) => (
                <Select
                  onChange={(option) => {
                    setType(option?.type)
                    field.onChange(Number(option?.value))
                  }
                  }
                  options={categories}
                />
              )}
            />
          </Field>
          {type && type.length > 0 && < Field label="Type">
            <Controller
              control={control}
              name="lease_payment.type"
              render={({ field }) => (
                <Select
                  onChange={(option) => {
                    field.onChange(option?.value)
                  }
                  }
                  options={type.map((p) => ({ label: p, value: p }))}
                />
              )}
            />
          </Field>}
          <Field label="Bank" errors={
            {
              key: "id_bank",
              data: errors.lease_payment
            }
          }>

            <Controller name="lease_payment.id_bank" control={control} render={({ field }) =>
              <Select
                placeholder="choissir une bank"
                options={banks.map((bank: any) => ({ value: bank.id, label: bank.bankName }))}
                onChange={async (option: any) => {
                  setCBank(banks.find((b: any) => b.id == option.value));
                  field.onChange(option.value);
                  await fetchReq(option.value);
                }}
              />
            } />
          </Field>

        </div>
        {loading && (
          <div className="min-h-[160px] flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!loading && reqs.length > 0 &&
          <div className="min-h-[160px] flex items-center justify-center">
            <h6 className='text-red-500'> Cette bank a déja une requête en cours</h6>
          </div>
        }
        {can && <div className="grid grid-cols-2 gap-3">

          <Field label="Nom du proprietaire"><Input disabled={true} {...register("lease_payment.landlordName")} /></Field>

          <Field label="Start date"
            errors={
              {
                key: "start_date",
                data: errors.lease_payment
              }
            }
          ><Input type="date" {...register("lease_payment.start_date")} /></Field>
          <Field label="End date"
            errors={
              {
                key: "end_date",
                data: errors.lease_payment
              }
            }
          ><Input type="date" {...register("lease_payment.end_date")} /></Field>

          <Field label="Years"
            errors={
              {
                key: "yearNumber",
                data: errors.lease_payment
              }
            }
          ><Input type="number" {...register("lease_payment.yearNumber", { valueAsNumber: true })} /></Field>
          <Field label="Rent cost"><Input disabled={true} type="number" step="1000" {...register("lease_payment.rentCost", { valueAsNumber: true })} /></Field>
          {/* <Field label="Who approves the bank"><Input disabled={true} {...register("lease_payment.whoApproveTheBank")} /></Field>
        <Field label="Created by"><Input disabled={true} {...register("lease_payment.create_by")} /></Field> */}
        </div>}
        {can && <><Field label="Renovation by the landlord">
          <Controller
            name="lease_payment.renovationByTheLandlord"
            render={({ field }) => (
              <div className="flex items-center gap-2"><Checkbox checked={!!field.value} onChange={field.onChange} /> <span className="text-sm text-muted-foreground">Yes</span></div>
            )}
          />
        </Field>
          <Field label="Description">
            <Input textArea {...register("lease_payment.description")} />
          </Field></>}
      </Section>
      {cbank && <CollapsSection title={"Detail Bank"} defaultOpen={false} >
        <>
          <div className="w-full h-100 mb-6 rounded-lg shadow-lg overflow-hidden">
            {cbank && <GoogleMapApp position={cbank.location} ></GoogleMapApp>}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2 text-pink-600">Photo</h2>
            <div className="grid grid-flow-row-dense grid-cols-3 grid-rows-2 gap-4">
              <div className="col-span-2 row-span-2 shadow-lg p-4 rounded-lg">
                <ImageGallery images={images} userId={userId || ''} canDelete={false} showPic={true} ></ImageGallery>
              </div>

              <div className="shadow-lg p-4 rounded-lg">
                <ImageLordComp images={lImages} userId={userId || ''} canDelete={false} showPic={true} ></ImageLordComp>
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <h2 className="text-2xl font-bold mb-2 text-pink-600">Details</h2>
            <Card className="p-2 rounded-lg">
              {cbank && <BankInfo bank={cbank} />}
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2 text-pink-600">Commentaires</h2>
            <Card>
              {cbank && cbank.id && <CommentsBank bankId={cbank.id} userId={userId || ''} isEdit={true} nextStep={function (step: number, data: any): void {

              }} only={false} />}
            </Card>
          </div>
        </>
      </CollapsSection>}
    </>

  );
}

export function BankRenovationFields({ t, categories }: any) {
  const { control, register, watch, setValue } = useFormContextTyped();
  const { fields, append, remove } = useFieldArray({ name: "bank_renovation.Bank", control });
  const [steps, setSteps] = useState<string>();
  const sregion = watch("general.id_region_user");
  const cat = watch('bank_renovation.categorie');
  const [contrat, setContrat] = useState<any>();
  const [contrats, setContrats] = useState<[]>() as any[];
  const [loading, setLoading] = useState(false) as any;
  const [reqs, setReqs] = useState([]) as any;
  const [can, setCan] = useState(false) as any;
  useEffect(() => {
    if (!cat) return;
    const steps_renov = ["renovSteps.peinture", "renovSteps.comptoire"];
    const steps = steps_renov[cat - 1];
    setSteps(steps);
  }, [cat]);

  useEffect(() => {
    if (!steps || !sregion) return;
    const run = async () => {
      await fetchTasks(sregion, steps);
    }
    run();
  }, [steps, sregion]);

  useEffect(() => {
    const run = async () => {
      if (contrat && can) {
        const total = contrat.montant_total + contrat.transport;
        const start = formatForInput(contrat.startDate);
        const end = formatForInput(contrat.endDate);
        setValue("bank_renovation.total_amount", total);
        setValue("bank_renovation.vendor_name", contrat.landlord?.fullName)
        setValue("bank_renovation.vendor_id", contrat.assignee)
        setValue("bank_renovation.contract_id", contrat.id);
        setValue("bank_renovation.start_date", start as any)
        setValue("bank_renovation.end_date", end as any);
      } else {
        setValue("bank_renovation.total_amount", null)
        setValue("bank_renovation.vendor_name", undefined);
        setValue("bank_renovation.vendor_id", undefined)
        setValue("bank_renovation.contract_id", null);
      }
    }
    run();
  }, [contrat, can]);

  const fetchTasks = async (region: number, step: string) => {
    try {
      setLoading(true)
      let q: Query<DocumentData>;
      q = query(contractsDoc, where('renovStep', '==', step), where('regionsId', 'array-contains', region), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const t = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const bankId = data.banksId[0];
          let bank = null;
          if (bankId) {
            const bankSnap = await getDoc(getBankDoc(bankId));
            bank = bankSnap.exists() ? bankSnap.data() : null;
          }
          const landlordId = data.assignee;
          let landlord = null;
          if (landlordId) {
            const landlordSnap = await getDoc(getLandlordDoc(landlordId));
            landlord = landlordSnap.exists() ? landlordSnap.data() : null;
          }
          const landlordId2 = data.createdBy;
          let employee = null;
          if (landlordId2) {
            employee = await getLandlordByUserId(landlordId2)
          }
          return { id: docSnap.id, ...data, firstBank: bank, landlord, employee };
        })
      ) as [];
      console.log(t);
      setLoading(false);
      setContrats(t);
    } catch (err) {
      setLoading(false);
      console.error("Error fetching landlords:", err);
    }
  };

  const getLandlordByUserId = async (userId: string) => {
    const q = query(LandlordDoc, where("id_user", '==', userId));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() }; // return first match
    } else {
      return null; // No match found
    }
  };

  const fetchContrat = async (bankId: string) => {
    if (!bankId) return;
    try {
      setCan(false);
      setLoading(true);
      const baseQuery = ExpenseRequestDoc as CollectionReference<DocumentData>;
      const q = query(
        baseQuery,
        where("bank_renovation.contract_id", "==", bankId),
        where("status", "not-in", ["rejected", "cancelled"]),
        orderBy("createdAt")
      );
      const snapshot = await getDocs(q);

      const reqs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as IRequest[];
      setLoading(false);
      setReqs(reqs);
      setCan(reqs.length === 0);
    } catch (error) {
      setCan(false);
      setLoading(false);
      console.error("Error fetching page:", error);
    }
  };



  return (
    <>
      <Section title="Bank Renovation">
        <Field label="Categorie">
          <Controller
            control={control}
            name="bank_renovation.categorie"
            render={({ field }) => (
              <Select
                onChange={(option) => {
                  // setType(option?.type)
                  field.onChange(Number(option?.value))
                }
                }
                options={categories}
              />
            )}
          />
        </Field>

        {contrats && contrats.length > 0 && <Field label="Contrat de renovation">
          <Controller
            control={control}
            name="bank_renovation.contract_id"
            render={({ field }) => (
              <Select
                onChange={(option) => {
                  setCan(false)
                  if (!option?.value) {
                    setCan(false)
                    setContrat(undefined);
                    field.onChange(undefined)
                  }
                  fetchContrat(option?.value);
                  setContrat(contrats.find((c: any) => c.id == String(option?.value)));
                  field.onChange(String(option?.value))
                }
                }
                options={contrats.map((c: any) => {
                  console.log(c);
                  const tb = c?.banksId?.length;
                  const l = `Contrat- ${c?.firstBank?.bankName} ${(tb - 1 > 0) ? '(+' + (tb-1) + ')' : ''} - ${c.landlord.fullName} - (${c.montant_total} HTG)`
                  return {
                    value: c?.id,
                    label: l
                  }
                })}
              />
            )}
          />
        </Field>}
        {loading && (
          <div className="min-h-[160px] flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!loading && contrats && contrats.length == 0 && (<div className="min-h-[50px] flex items-center justify-center">
          <b className='text-red-400 text-center'>0 contrat de renovation trouvé</b>
        </div>)}
        {!loading && reqs.length > 0 &&
          <div className="min-h-[160px] flex items-center justify-center">
            <h6 className='text-red-500'> Cet contrat a déja une requête en cours</h6>
          </div>
        }
        {can && <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date"><Input type="date" {...register("bank_renovation.start_date", { valueAsDate: true })} /></Field>
            <Field label="End date"><Input type="date" {...register("bank_renovation.end_date", { valueAsDate: true })} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Founisseur de service"><Input readOnly {...register("bank_renovation.vendor_name")} /></Field>
            <Field label="Total amount"><Input type="number" readOnly step="0.01" {...register("bank_renovation.total_amount", { valueAsNumber: true })} /></Field>
          </div>
          <Field label="Description"><Input textArea {...register("bank_renovation.description")} /></Field>
        </>}


      </Section >
      {contrat && <CollapsSection title={'Details sur le contrat de Revovation'} >
        <ContractDeService contract={contrat} employee={contrat.landlord} proprio={contrat.employee} ></ContractDeService>
        <></></CollapsSection>}
    </>



  );
}


export function useFormContextTyped() {
  return useFormContext<MoneyRequest>();
}

