import { Dialog, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { BaSyxRbacRule } from 'lib/services/rbac-service/RbacRulesService';
import { DialogCloseButton } from 'components/basics/DialogCloseButton';
import { createRbacRule } from 'lib/services/rbac-service/RbacActions';
import { mapFormModelToBaSyxRbacRule } from 'app/[locale]/settings/_components/role-settings/FormMappingHelper';
import { useShowError } from 'lib/hooks/UseShowError';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { RuleForm, RuleFormModel } from 'app/[locale]/settings/_components/role-settings/RuleForm';

type RoleDialogProps = {
    readonly onClose: (reload: boolean) => void;
    readonly open: boolean;
};

export const CreateRuleDialog = (props: RoleDialogProps) => {
    const t = useTranslations('pages.settings.rules');
    const { showError } = useShowError();
    const notificationSpawner = useNotificationSpawner();

    const defaultRbacRule: BaSyxRbacRule = {
        action: 'READ',
        targetInformation: { '@type': 'aas', aasIds: ['*'] },
        role: '',
        idShort: '',
    };

    async function onSubmit(data: RuleFormModel) {
        const mappedDto = mapFormModelToBaSyxRbacRule(data, defaultRbacRule);
        const response = await createRbacRule(mappedDto);
        if (response.isSuccess) {
            notificationSpawner.spawn({
                message: t('saveSuccess'),
                severity: 'success',
            });
            onCloseDialog(true);
        } else {
            showError(response.message);
        }
    }

    const onCloseDialog = (reload: boolean) => {
        props.onClose(reload);
    };

    return (
        <Dialog open={props.open} onClose={() => onCloseDialog(false)} maxWidth="md" fullWidth={true}>
            <Typography variant="h2" color="primary" sx={{ mt: 4, ml: '40px' }}>
                {t('createTitle')}
            </Typography>
            <DialogCloseButton handleClose={() => onCloseDialog(false)} />
            <RuleForm rule={defaultRbacRule} onSubmit={onSubmit} onCancel={() => onCloseDialog(false)} />
        </Dialog>
    );
};
