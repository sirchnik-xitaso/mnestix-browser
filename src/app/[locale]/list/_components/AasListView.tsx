'use client';

import { useState } from 'react';
import { Box } from '@mui/material';
import { SelectRepository } from './SelectRepository';
import AasListDataWrapper from './AasListDataWrapper';

export const AasListView = () => {
    const [selectedRepository, setSelectedRepository] = useState<string | undefined>();

    return (
        <>
            <Box display="flex" gap={4} marginBottom={2}>
                <SelectRepository onSelectedRepositoryChanged={setSelectedRepository}/>
            </Box>
            <AasListDataWrapper
                aasRepository={selectedRepository}
            />
        </>
    );
};
