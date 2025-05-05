/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormItem, Checkbox, Button } from '@/components/ui';
import {
  currentSecurities,
  majorRenovations,
  minorRenovations,
} from '@/views/Entity';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/utils/hooks/useTranslation';

const schema = z.object({
  neededSecurity: z.array(z.enum(currentSecurities)),
  majorRenovation: z.array(z.enum(majorRenovations)),
  minorRenovation: z.array(z.enum(minorRenovations)),
});

export type RenovationFormValues = z.infer<typeof schema>;

interface Props {
  nextStep: (step: number, data: any) => void;
  defaultValues?: Partial<RenovationFormValues>;
  isEdit?: boolean,
}

const RenovationDetails = ({ nextStep, defaultValues, isEdit }: Props) => {
  const [isSubmitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RenovationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      neededSecurity: defaultValues?.neededSecurity,
      majorRenovation: defaultValues?.majorRenovation,
      minorRenovation: defaultValues?.minorRenovation,
    },
  });

  const onSubmit = (data: RenovationFormValues) => {
    console.log('Renovation Details:', data);
    setSubmitting(true)
    reset();
    nextStep(5, data);
    setTimeout(() => setSubmitting(false), 1000) 
  };

     useEffect(() => {
          reset({
            neededSecurity: defaultValues?.neededSecurity,
            majorRenovation: defaultValues?.majorRenovation,
            minorRenovation: defaultValues?.minorRenovation,
          });
        }, [defaultValues, reset]);

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
  <Form onSubmit={handleSubmit(onSubmit)}>

    <FormItem
      label={t('bank.currentSecurities.label')}
      invalid={!!errors.neededSecurity}
      errorMessage={errors.neededSecurity?.message}
      className="mb-6"
    >
      <Controller
        name="neededSecurity"
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
      label={t('bank.majorRenovations.label')}
      invalid={!!errors.majorRenovation}
      errorMessage={errors.majorRenovation?.message}
      className="mb-6"
    >
      <Controller
        name="majorRenovation"
        control={control}
        render={({ field }) => (
          <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
            {majorRenovations.map((option, key) => (
              <Checkbox key={key} value={option}>
                {t(`bank.${option}`)}
              </Checkbox>
            ))}
          </Checkbox.Group>
        )}
      />
    </FormItem>

    <FormItem
      label={t('bank.minorRenovations.label')}
      invalid={!!errors.minorRenovation}
      errorMessage={errors.minorRenovation?.message}
      className="mb-6"
    >
      <Controller
        name="minorRenovation"
        control={control}
        render={({ field }) => (
          <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
            {minorRenovations.map((option, key) => (
              <Checkbox key={key} value={option}>
                {t(`bank.${option}`)}
              </Checkbox>
            ))}
          </Checkbox.Group>
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

export default RenovationDetails;
