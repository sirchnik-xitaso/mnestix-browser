'use client';

import { useEnv } from 'app/env/provider';
import { useState } from 'react';
import { Box } from '@mui/material';
import { AasListComparisonHeader } from 'app/[locale]/list/_components/AasListComparisonHeader';
import { SelectRepository } from './SelectRepository';
import AasListDataWrapper from './AasListDataWrapper';

export const AasListView = () => {
    const [selectedAasList, setSelectedAasList] = useState<string[]>();
    const [selectedRepository, setSelectedRepository] = useState<string | undefined>();
    const env = useEnv();

    /**
     * Update the list of currently selected aas
     */
    const updateSelectedAasList = (isChecked: boolean, aasId: string | undefined) => {
        if (!aasId) return;
        let selected: string[] = [];

        if (isChecked) {
            selected = selected.concat(selectedAasList ? selectedAasList : [], [aasId]);
            selected = [...new Set(selected)];
        } else if (!isChecked && selectedAasList) {
            selected = selectedAasList.filter((aas) => {
                return aas !== aasId;
            });
        } else {
            return;
        }

        setSelectedAasList(selected);
    };

    return (
        <>
            {env.COMPARISON_FEATURE_FLAG && (
                <AasListComparisonHeader
                    selectedAasList={selectedAasList}
                    updateSelectedAasList={updateSelectedAasList}
                />
            )}
                <>
                    <Box display="flex" gap={4} marginBottom={2}>
                        <SelectRepository onSelectedRepositoryChanged={setSelectedRepository}/>
                        {/*<SelectProductType aasList={aasList} setAasListFiltered={setAasListFiltered} />*/}
                    </Box>
                    <AasListDataWrapper
                        selectedAasList={selectedAasList}
                        updateSelectedAasList={updateSelectedAasList}
                        aasRepository={selectedRepository}
                    />
                </>
        </>
    );
};
