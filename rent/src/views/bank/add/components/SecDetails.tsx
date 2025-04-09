/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormItem, Checkbox, Button, Radio } from '@/components/ui';
import {
  areaStabilities,
  openHours,
  closeHours,
  currentSecurities,
  roofTypes
} from '@/views/Entity';
import { useEffect, useState } from 'react';
import useTranslation from '@/utils/hooks/useTranslation';

const schema = z.object({
  areaStability: z.enum(areaStabilities),
  openHour: z.enum(openHours),
  closeHour: z.enum(closeHours),
  currentSecurity: z.array(z.enum(currentSecurities)),
  roof: z.enum(roofTypes),
});

export type SecurityFormValues = z.infer<typeof schema>;

interface Props {
  nextStep: (step: number, data: any) => void;
  defaultValues?: Partial<SecurityFormValues>;
  isEdit?: boolean,
}

const SecurityDetails = ({ nextStep, defaultValues, isEdit=false }: Props) => {
  const [isSubmitting, setSubmitting] = useState(false)
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SecurityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      areaStability: defaultValues?.areaStability,
      openHour: defaultValues?.openHour,
      closeHour: defaultValues?.closeHour,
      currentSecurity: defaultValues?.currentSecurity,
      roof: defaultValues?.roof,
    },
  });

  useEffect(() => {
          reset({
            areaStability: defaultValues?.areaStability,
            openHour: defaultValues?.openHour,
            closeHour: defaultValues?.closeHour,
            currentSecurity: defaultValues?.currentSecurity ,
            roof: defaultValues?.roof,
          });
  }, [defaultValues, reset]);

  const onSubmit = (data: SecurityFormValues) => {
    setSubmitting(true)
                 reset();
                 nextStep(4, data);
    setTimeout(() => setSubmitting(false), 1000) 
                 console.log("Submitted data:", data)
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
  <Form onSubmit={handleSubmit(onSubmit)}>
    <FormItem
      label={t('bank.areaStabilities.label')}
      invalid={!!errors.areaStability}
      errorMessage={errors.areaStability?.message}
      className="mb-6"
    >
      <Controller
        name="areaStability"
        control={control}
        render={({ field }) => (
          <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
            {areaStabilities.map((option, key) => (
              <Radio key={key} value={option}>
                {t(`bank.${option}`)}
              </Radio>
            ))}
          </Radio.Group>
        )}
      />
    </FormItem>

    <FormItem
      label={t('bank.openHours.label')}
      invalid={!!errors.openHour}
      errorMessage={errors.openHour?.message}
      className="mb-6"
    >
      <Controller
        name="openHour"
        control={control}
        render={({ field }) => (
          <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
            {openHours.map((option, key) => (
              <Radio key={key} value={option}>
                {t(`bank.${option}`)}
              </Radio>
            ))}
          </Radio.Group>
        )}
      />
    </FormItem>

    <FormItem
      label={t('bank.closeHours.label')}
      invalid={!!errors.closeHour}
      errorMessage={errors.closeHour?.message}
      className="mb-6"
    >
      <Controller
        name="closeHour"
        control={control}
        render={({ field }) => (
          <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
            {closeHours.map((option, key) => (
              <Radio key={key} value={option}>
                {t(`bank.${option}`)}
              </Radio>
            ))}
          </Radio.Group>
        )}
      />
    </FormItem>

    <FormItem
      label={t('bank.currentSecurities.label')}
      invalid={!!errors.currentSecurity}
      errorMessage={errors.currentSecurity?.message}
      className="mb-6"
    >
      <Controller
        name="currentSecurity"
        control={control}
        render={({ field }) => (
          <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
            {currentSecurities.map((option, key) => (
              <Checkbox key={key} value={option}>
                {t(`bank.${option}`)}
              </Checkbox>
            ))}
          </Checkbox.Group>
        )}
      />
    </FormItem>

    
    <FormItem
      label={t('bank.roof.label')}
      invalid={!!errors.roof}
      errorMessage={errors.roof?.message}
      className="mb-6"
    >
      <Controller
        name="roof"
        control={control}
        render={({ field }) => (
          <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
            {roofTypes.map((option, key) => (
              <Radio key={key} value={option}>
                {t(`bank.${option}`)}
              </Radio>
            ))}
          </Radio.Group>
        )}
      />
    </FormItem>

    <div className="mt-6">
      <Button type="submit" variant="solid">
        {isEdit ? t('common.update') : t('common.next')}
      </Button>
    </div>
  </Form>
</div>

  );
};

export default SecurityDetails;
