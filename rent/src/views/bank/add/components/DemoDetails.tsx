/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormItem, Form, Button, Checkbox, Radio } from '@/components/ui';
import {
  internetProviders,
  previousUses,
  nonRenewalReasons,
  lotteryCompetitions,
  clientVisibilities,
  buildingStabilities,
  bankEntrances,
  expectedRevenue,
  populationInAreas,
} from '@/views/Entity';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import useTranslation from '@/utils/hooks/useTranslation';

const schema = z.object({
  internetService: z.array(z.enum(internetProviders)),
  previousUse:  z.array(z.enum(previousUses)),
  nonRenewalReason: z.enum(nonRenewalReasons),
  lotteryCompetition: z.enum(lotteryCompetitions),
  clientVisibility: z.array(z.enum(clientVisibilities)), // clientVisibility
  populationInArea: z.string(),
  expectedRevenue: z.string(),
  buildingStability: z.enum(buildingStabilities),
  bankEntrance: z.array(z.enum(bankEntrances)), // bankEntrance
  // toilet: z.boolean().optional(),
  // water: z.boolean().optional(),
  // electricity: z.boolean().optional(),
  // airConditioning: z.boolean().optional(),
});

export type FormValuesInfo = z.infer<typeof schema>;

interface FormProps {
  nextStep: (step: number, data: any) => void;
  defaultValues?: Partial<FormValuesInfo>;
  isEdit?: boolean,
}

function DemoDetails({ nextStep, defaultValues, isEdit= false }: FormProps) {
  const [isSubmitting, setSubmitting] = useState(false);
  const { t } = useTranslation();
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValuesInfo>({
    resolver: zodResolver(schema),
    defaultValues: {
      internetService: defaultValues?.internetService || [],
      previousUse: defaultValues?.previousUse || [],
      nonRenewalReason: defaultValues?.nonRenewalReason ,
      lotteryCompetition: defaultValues?.lotteryCompetition,
      clientVisibility: defaultValues?.clientVisibility || [],
      populationInArea: defaultValues?.populationInArea,
      expectedRevenue: defaultValues?.expectedRevenue,
      buildingStability: defaultValues?.buildingStability,
      bankEntrance: defaultValues?.bankEntrance || [],
    },
  });

    useEffect(() => {
        reset({
          internetService: defaultValues?.internetService || [],
          previousUse: defaultValues?.previousUse || [] ,
          nonRenewalReason: defaultValues?.nonRenewalReason ,
          lotteryCompetition: defaultValues?.lotteryCompetition,
          clientVisibility: defaultValues?.clientVisibility || [],
          populationInArea: defaultValues?.populationInArea,
          expectedRevenue: defaultValues?.expectedRevenue,
          buildingStability: defaultValues?.buildingStability,
          bankEntrance: defaultValues?.bankEntrance || [],
        });
      }, [defaultValues, reset]);

  const onSubmit = async (data: FormValuesInfo) => {
    setSubmitting(true);
    reset();
    nextStep(3, data);
    setTimeout(() => setSubmitting(false), 1000);
    console.log('Submitted data:', data);
  };

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-700 rounded p-4 shadow">
    <Form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <FormItem label={t('bank.internetProviders.label')} invalid={!!errors.internetService} errorMessage={errors.internetService?.message}>
          <Controller
            name="internetService"
            control={control}
            render={({ field }) => (
              <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
                {internetProviders.map((obj, key) => (
                  <Checkbox key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          />
        </FormItem>
  
        <FormItem label={t('bank.previousUses.label')} invalid={!!errors.previousUse} errorMessage={errors.previousUse?.message}>
          <Controller
            name="previousUse"
            control={control}
            render={({ field }) => (
              <Checkbox.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
                {previousUses.map((obj, key) => (
                  <Checkbox key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          />
        </FormItem>
  
        <FormItem label={t('bank.nonRenewalReasons.label')} invalid={!!errors.nonRenewalReason} errorMessage={errors.nonRenewalReason?.message}>
          <Controller
            name="nonRenewalReason"
            control={control}
            render={({ field }) => (
              <Radio.Group vertical value={field.value ?? undefined} onChange={(value) => field.onChange(value)}>
                {nonRenewalReasons.map((obj, key) => (
                  <Radio key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          />
        </FormItem>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
        <FormItem label={t('bank.lotteryCompetitions.label')} invalid={!!errors.lotteryCompetition} errorMessage={errors.lotteryCompetition?.message}>
          <Controller
            name="lotteryCompetition"
            control={control}
            render={({ field }) => (
              <Radio.Group vertical value={field.value} onChange={(value) => field.onChange(value)}>
                {lotteryCompetitions.map((obj, key) => (
                  <Radio key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          />
        </FormItem>
  
        <FormItem label={t('bank.clientVisibilities.label')} invalid={!!errors.clientVisibility} errorMessage={errors.clientVisibility?.message}>
          <Controller
            name="clientVisibility"
            control={control}
            render={({ field }) => (
              <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
                {clientVisibilities.map((obj, key) => (
                  <Checkbox key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          />
        </FormItem>
  
        <FormItem label={t('bank.bankEntrances.label')} invalid={!!errors.bankEntrance} errorMessage={errors.bankEntrance?.message}>
          <Controller
            name="bankEntrance"
            control={control}
            render={({ field }) => (
              <Checkbox.Group vertical value={field.value ?? []} onChange={(value) => field.onChange(value)}>
                {bankEntrances.map((obj, key) => (
                  <Checkbox key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            )}
          />
        </FormItem>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
        <FormItem label={t('bank.populationInAreas.label')} invalid={!!errors.populationInArea} errorMessage={errors.populationInArea?.message}>
          <Controller
            name="populationInArea"
            control={control}
            render={({ field }) => (
              <Radio.Group vertical value={field.value || undefined} onChange={(value) => field.onChange(value)}>
                {populationInAreas.map((obj, key) => (
                  <Radio key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          />
        </FormItem>
  
        <FormItem label={t('bank.expectedRevenue.label')} invalid={!!errors.expectedRevenue} errorMessage={errors.expectedRevenue?.message}>
          <Controller
            name="expectedRevenue"
            control={control}
            render={({ field }) => (
              <Radio.Group vertical value={field.value || undefined} onChange={(value) => field.onChange(value)}>
                {expectedRevenue.map((obj, key) => (
                  <Radio key={key} value={obj}>
                    {t(`bank.${obj}`)}
                  </Radio>
                ))}
              </Radio.Group>
            )}
          />
        </FormItem>
  
        <FormItem label={t('bank.buildingStabilities.label')} invalid={!!errors.buildingStability} errorMessage={errors.buildingStability?.message}>
          <Controller
            name="buildingStability"
            control={control}
            render={({ field }) => (
              <Radio.Group vertical value={field.value || undefined} onChange={(value) => field.onChange(value)}>
                {buildingStabilities.map((obj, key) => (
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
        <Button type="submit" variant="solid" loading={isSubmitting}>
          {isEdit ? t('common.update') : t('common.next')}
        </Button>
      </div>
    </Form>
  </div>
  
  );
}

export default DemoDetails;
