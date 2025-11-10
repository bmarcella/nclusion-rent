/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, FormItem, Input, Select, Checkbox, Button } from '@/components/ui';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/utils/hooks/useTranslation';
import { useSessionUser } from '@/store/authStore';
import { manageAuth } from '@/constants/roles.constant';
import { AuthRequest, requestStatus, requestType } from '../entities/AuthRequest';

const schema = z.object({
    region_id: z.coerce.number().min(1, 'Required'),
    roles: z.array(z.string()).nonempty('Required'),
    status: z.string(),
    reqType: z.array(z.number()),
    max_amount: z.preprocess(
        (v) => (v === '' || v === null ? undefined : Number(v)),
        z.number({ required_error: 'Required' }).min(1, 'Must be greater than 0')
    ),
    canApprove: z.boolean(),
    create_at: z.date(),
});

interface AuthFormProps {
    onSubmitForm: (data: AuthRequest) => void;
    defaultValues?: Partial<AuthRequest>;
    loading?: boolean;
}

function AuthForm({ onSubmitForm, defaultValues, loading = false }: AuthFormProps) {
    const { t } = useTranslation();
    const { authority, proprio } = useSessionUser((s) => s.user);
    const statuses = requestStatus(t);
    const reqTypes = requestType(t);
    // Options state loaded asynchronously
    const [roleOptions, setRoleOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [regionOptions, setRegionOptions] = useState<Array<{ label: string; value: number; cities?: string[] }>>([]);
    const [optLoading, setOptLoading] = useState(false);
    const [statusOptions, setStatusOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [reqOptions, setReqOptions] = useState<Array<{ label: string; value: string }>>([]);

    // Load roles/regions AFTER render via effect (no async work in render)
    useEffect(() => {
        const load = async () => {
            setStatusOptions(statuses)
            setReqOptions(reqTypes as any);
            if (!authority || authority.length === 0) return;
            setOptLoading(true);
            try {
                const { roles, regions } = await manageAuth(authority[0], proprio, t);
                // Expecting manageAuth to already shape {label,value}. If not, map here.
                setRoleOptions(roles);       // roles: [{label, value: string}]
                setRegionOptions(regions);   // regions: [{label, value: number}]
            } finally {
                setOptLoading(false);
            }
        };
        load();
    }, [authority, proprio, t]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<AuthRequest>({
        resolver: zodResolver(schema),
        defaultValues: {
            region_id: defaultValues?.region_id ?? 0,
            roles: defaultValues?.roles ?? [],
            status: defaultValues?.status ?? '',
            max_amount: defaultValues?.max_amount as any ?? 0,
            canApprove: defaultValues?.canApprove ?? false,
            reqType: defaultValues?.reqType ?? [],
            create_at: defaultValues?.create_at ?? new Date(),
        },
    });

    const onSubmit = (data: AuthRequest) => onSubmitForm(data);

    // Disable submit if options are still loading or region not chosen
    const submitDisabled = useMemo(
        () => loading || optLoading,
        [loading, optLoading]
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded shadow w-full">
            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Status */}
                    <FormItem
                        label={t('authReq.status')}
                        invalid={!!errors.status}
                        errorMessage={errors.status?.message}
                    >
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isLoading={optLoading}
                                    placeholder={t('common.select')}
                                    options={statusOptions}
                                    value={statusOptions.find(opt => String(opt.value) === String(field.value)) || null}
                                    onChange={(opt) => field.onChange(String(opt?.value))}
                                />
                            )}

                        />
                    </FormItem>

                     {/* RequestType */}
                    <FormItem
                        label={t('authReq.reqType')}
                        invalid={!!errors.reqType}
                        errorMessage={errors.reqType?.message}
                    >
                        <Controller
                            name="reqType"
                            control={control}
                            
                            render={({ field }) => (
                                <Select
                                    isLoading={optLoading}
                                    isMulti
                                    placeholder={t('common.select')}
                                    options={reqOptions}
                                    value={ reqOptions.filter(opt => field.value.includes(Number(opt.value)))}
                                    onChange={(opts: any[]) => field.onChange(opts.map(o => o.value))}
                                />
                            )}

                        />
                    </FormItem>

                    {/* Region */}
                    <FormItem
                        label={t('authReq.region')}
                        invalid={!!errors.region_id}
                        errorMessage={errors.region_id?.message}
                    >
                        <Controller
                            name="region_id"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isLoading={optLoading}
                                    placeholder={t('common.select')}
                                    options={regionOptions}
                                    value={regionOptions.find(opt => Number(opt.value) === Number(field.value)) || null}
                                    onChange={(opt) => field.onChange(Number(opt?.value))}
                                />
                            )}
                        />
                    </FormItem>

                    {/* Roles */}
                    <FormItem
                        label={t('authReq.roles')}
                        invalid={!!errors.roles}
                        errorMessage={errors.roles?.message as string}
                    >
                        <Controller
                            name="roles"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    isLoading={optLoading}
                                    isMulti
                                    placeholder={t('common.select')}
                                    options={roleOptions}
                                    value={roleOptions.filter(opt => field.value.includes(String(opt.value)))}
                                    onChange={(opts: any[]) => field.onChange(opts.map(o => String(o.value)))}
                                />
                            )}
                        />
                    </FormItem>

                    {/* Max amount */}
                    <FormItem
                        label={t('authReq.maxAmount')}
                        invalid={!!errors.max_amount}
                        errorMessage={errors.max_amount?.message}
                    >
                        <Controller
                            name="max_amount"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="number"
                                    prefix="HTG"
                                    {...field}
                                    value={field.value ?? ''}                      // allow empty input
                                    onChange={(e) => field.onChange(e.target.value)} // keep as string
                                    inputMode="decimal"
                                />
                            )}
                        />
                    </FormItem>

                    {/* Can Approve */}
                    <FormItem
                        label={t('authReq.canApprove')}
                        invalid={!!errors.canApprove}
                        errorMessage={errors.canApprove?.message}
                    >
                        <Controller
                            name="canApprove"
                            control={control}
                            render={({ field }) => (
                                <Checkbox checked={field.value} onChange={field.onChange} />
                            )}
                        />
                    </FormItem>

                </div>

                <div className="mt-6">
                    <Button type="submit" variant="solid" loading={submitDisabled} disabled={submitDisabled}>
                        {t('common.submit')}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

export default AuthForm;
