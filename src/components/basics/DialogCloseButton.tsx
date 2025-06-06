import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

type CloseIconButtonProps = {
    handleClose: () => void;
    dataTestId? : string;
};

export function DialogCloseButton({ handleClose, dataTestId }: CloseIconButtonProps) {
    return (
        <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                zIndex: 1,
                color: (theme) => theme.palette.grey[500],
            }}
            data-testid={dataTestId}
        >
            <CloseIcon />
        </IconButton>
    );
}