import { Box, Typography } from '@mui/material';
import AuthenticationLock from 'assets/authentication_lock.svg';
import SignInButton from 'components/authentication/SignInButton';
import { useTranslations } from 'next-intl';

export function AuthenticationPrompt() {
    const t = useTranslations('validation.authentication');
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'column',
                width: 'auto',
                m: 3,
                mt: 5,
            }}
        >
            <Typography variant="h2" sx={{ mb: 2 }} color="primary" align="center">
                {t('authenticationNeeded')}
            </Typography>
            <AuthenticationLock data-testid="authentication-prompt-lock" />
            <SignInButton />
        </Box>
    );
}
