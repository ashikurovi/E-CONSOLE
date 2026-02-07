import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Globe, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSelector } from 'react-redux';
import { useAddCustomDomainMutation } from '@/features/devops/devopsApiSlice'; // We need to create this slice

const DomainSettings = ({ user: userFromApi }) => {
  const { t } = useTranslation();
  const [addCustomDomain, { isLoading }] = useAddCustomDomainMutation();
  const authUser = useSelector((state) => state.auth.user);
  const user = userFromApi ?? authUser ?? null;
  const tenantId = user?.tenantId || user?.companyId; 

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      domain: ''
    }
  });

  useEffect(() => {
    reset({ domain: user?.customDomain ?? '' });
  }, [user?.customDomain, reset]);

  const onSubmit = async (data) => {
    try {
      const res = await addCustomDomain({ id: tenantId, domain: data.domain }).unwrap();
      toast.success(t('settings.domainConnected'));
      // Ideally update local state or user slice here
    } catch (error) {
      toast.error(error?.data?.message || t('settings.domainConnectFailed'));
    }
  };

  return (
    <Card className="border border-gray-100 dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-base font-semibold">{t('settings.customDomain')}</CardTitle>
        </div>
        <CardDescription>
          {t('settings.connectDomainDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            <AlertCircle className="h-4 w-4" />
            {t('settings.dnsSetupTitle')}
          </h4>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {t('settings.dnsSetupInstruction')} <strong>ingress.squadcart.app</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-black/70 dark:text-white/70">
              {t('settings.domainName')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                {...register('domain', { 
                  required: t('settings.domainRequired'),
                  pattern: {
                    value: /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/,
                    message: t('settings.invalidDomain')
                  }
                })}
                placeholder="shop.example.com"
                className="flex-1 px-3 py-2 border border-gray-100 dark:border-gray-800 rounded-md bg-white dark:bg-[#1a1a1a] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('settings.connect')}
              </Button>
            </div>
            {errors.domain && (
              <p className="text-sm text-red-500 mt-1">{errors.domain.message}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DomainSettings;
