/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Form,  Button, Checkbox, Radio } from '@/components/ui';
import useTranslation from '@/utils/hooks/useTranslation';
import { paymentMethods, paymentStructures, locationTypes, locationAreas, Bank, verifyOwners, whoReferreds } from '@/views/Entity';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  paymentMethod: z.array(z.enum(paymentMethods)),  
  paymentStructure: z.enum(paymentStructures),
  locationType: z.enum(locationTypes),
  verifyOwner: z.array(z.enum(verifyOwners)),
  whoReferred: z.array( z.enum(whoReferreds)),
  locationArea: z.enum(locationAreas),
});

export type FormValuesInfo = z.infer<typeof schema>;

interface FormProps {
  nextStep: (step: number,data: any) => void,
  defaultValues?: Partial<FormValuesInfo>;
  isEdit?: boolean,
}

function RentDetails({ nextStep, defaultValues, isEdit= false } : FormProps) {

  const [isSubmitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  console.log("defaultValues", defaultValues);
    const {
        control,
        reset,
        handleSubmit,
        formState: { errors },
      } = useForm<FormValuesInfo>({
        resolver: zodResolver(schema),
        defaultValues: {
            paymentMethod: defaultValues?.paymentMethod,
            paymentStructure: defaultValues?.paymentStructure,
            locationType: defaultValues?.locationType ,
            verifyOwner: defaultValues?.verifyOwner,
            whoReferred: defaultValues?.whoReferred,
            locationArea: defaultValues?.locationArea ,
        },
      })

      useEffect(() => {
        reset({
          paymentMethod: defaultValues?.paymentMethod,
          paymentStructure: defaultValues?.paymentStructure,
          locationType: defaultValues?.locationType,
          verifyOwner: defaultValues?.verifyOwner,
          whoReferred: defaultValues?.whoReferred,
          locationArea: defaultValues?.locationArea,
        });
      }, [defaultValues, reset]);

      const onSubmit = async (data: FormValuesInfo) => {
                 setSubmitting(true)
                 reset();
                 nextStep(2, data as Bank['rentDetails']);
                 setTimeout(() => setSubmitting(false), 1000) 
                 console.log("Submitted data:", data)
           }    
  return (
    <>
      <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
  <Form onSubmit={handleSubmit(onSubmit)}>
    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      <FormItem
        label={t('bank.paymentMethods.label')}
        invalid={!!errors.paymentMethod}
        errorMessage={errors.paymentMethod?.message}
        className="mb-6"
      >
        <Controller
          name="paymentMethod"
          control={control}
          render={({ field }) => (
            <Checkbox.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
              {paymentMethods.map((obj, key) => (
                <Checkbox key={key} value={obj}>
                  {t(`bank.${obj}`)}
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}
        />
      </FormItem>

      <FormItem
        label={t('bank.paymentStructures.label')}
        invalid={!!errors.paymentStructure}
        errorMessage={errors.paymentStructure?.message}
        className="mb-6"
      >
        <Controller
          name="paymentStructure"
          control={control}
          render={({ field }) => (
            <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
              {paymentStructures.map((obj, key) => (
                <Radio key={key} value={obj}>
                  {t(`bank.${obj}`)}
                </Radio>
              ))}
            </Radio.Group>
          )}
        />
      </FormItem>

      <FormItem
        label={t('bank.locationTypes.label')}
        invalid={!!errors.locationType}
        errorMessage={errors.locationType?.message}
        className="mb-6"
      >
        <Controller
          name="locationType"
          control={control}
          render={({ field }) => (
            <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
              {locationTypes.map((obj, key) => (
                <Radio key={key} value={obj}>
                  {t(`bank.${obj}`)}
                </Radio>
              ))}
            </Radio.Group>
          )}
        />
      </FormItem>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
      <FormItem
        label={t('bank.verifyOwners.label')}
        invalid={!!errors.verifyOwner}
        errorMessage={errors.verifyOwner?.message}
        className="mb-6"
      >
        <Controller
          name="verifyOwner"
          control={control}
          render={({ field }) => (
            <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
              {verifyOwners.map((obj, key) => (
                <Checkbox key={key} value={obj}>
                  {t(`bank.${obj}`)}
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}
        />
      </FormItem>

      <FormItem
        label={t('bank.whoReferreds.label')}
        invalid={!!errors.whoReferred}
        errorMessage={errors.whoReferred?.message}
        className="mb-6"
      >
        <Controller
          name="whoReferred"
          control={control}
          render={({ field }) => (
            <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
              {whoReferreds.map((obj, key) => (
                <Checkbox key={key} value={obj}>
                  {t(`bank.${obj}`)}
                </Checkbox>
              ))}
            </Checkbox.Group>
          )}
        />
      </FormItem>

      <FormItem
        label={t('bank.locationAreas.label')}
        invalid={!!errors.locationArea}
        errorMessage={errors.locationArea?.message}
        className="mb-6"
      >
        <Controller
          name="locationArea"
          control={control}
          render={({ field }) => (
            <Radio.Group vertical value={field.value ?? undefined} onChange={(value) => field.onChange(value)}>
              {locationAreas.map((obj, key) => (
                <Radio key={key} value={obj}>
                  {t(`bank.${obj}`)}
                </Radio>
              ))}
            </Radio.Group>
          )}
        />
      </FormItem>
    </div>

    <div className="mt-6">
      <Button type="submit" variant="solid">
        {isEdit ? t('common.update') : t('common.next')}
      </Button>
    </div>
  </Form>
</div>


    </>
  )
}

export default RentDetails