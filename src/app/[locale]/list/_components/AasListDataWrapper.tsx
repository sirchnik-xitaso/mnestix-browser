import { AasListDto, ListEntityDto } from 'lib/services/list-service/ListService';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { getAasListEntities } from 'lib/services/list-service/aasListApiActions';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import AasList from './AasList';
import { useEnv } from 'app/env/provider';
import { SelectProductType } from './SelectProductType';
import { AasListComparisonHeader } from './AasListComparisonHeader';
import { Box } from '@mui/material';

type AasListProps = {
    aasRepository: string | undefined;
};

export default function AasListDataWrapper(props: AasListProps) {
    const { aasRepository } = props;
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [aasList, setAasList] = useState<AasListDto>();
    const [, setAasListFiltered] = useState<ListEntityDto[]>();
    const [selectedAasList, setSelectedAasList] = useState<string[]>();
    const env = useEnv();
    const notificationSpawner = useNotificationSpawner();
    useAsyncEffect(async () => {
        if (!aasRepository) return;

        try {
            setIsLoadingList(true);
            const list = await getAasListEntities(aasRepository!, 10);
            setAasList(list);
            setAasListFiltered(list.entities);
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoadingList(false);
        }
    }, [aasRepository]);


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
        <> {isLoadingList ? <CenteredLoadingSpinner sx={{ mt: 10 }} /> :
            <>
                <Box display="flex" justifyContent="space-between">
                    <SelectProductType aasList={aasList?.entities} setAasListFiltered={setAasListFiltered} />
                    {env.COMPARISON_FEATURE_FLAG && (
                        <AasListComparisonHeader
                            selectedAasList={selectedAasList}
                            updateSelectedAasList={updateSelectedAasList}
                        />
                    )}
                </Box>
                <AasList
                    shells={aasList}
                    selectedAasList={selectedAasList}
                    updateSelectedAasList={updateSelectedAasList}
                    comparisonFeatureFlag={env.COMPARISON_FEATURE_FLAG}>
                </AasList>
            </> }
        </>
    );
}
