import { AasListDto } from 'lib/services/list-service/ListService';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { getAasListEntities } from 'lib/services/list-service/aasListApiActions';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import AasList from './AasList';
import { useEnv } from 'app/env/provider';

type AasListProps = {
    selectedAasList: string[] | undefined;
    updateSelectedAasList: (isChecked: boolean, aasId: string | undefined) => void;
    aasRepository: string | undefined;
};

export default function AasListDataWrapper(props: AasListProps) {
    const { selectedAasList, updateSelectedAasList, aasRepository } = props;
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [aasList, setAasList] = useState<AasListDto>();
    const [, setAasListFiltered] = useState<AasListDto>();
    const env = useEnv();
    const notificationSpawner = useNotificationSpawner();
    useAsyncEffect(async () => {
        if (!aasRepository) return;

        try {
            setIsLoadingList(true);
            const list = await getAasListEntities(aasRepository!, 10);
            setAasList(list);
            setAasListFiltered(list);
        } catch (e) {
            showError(e, notificationSpawner);
        } finally {
            setIsLoadingList(false);
        }
    }, [aasRepository]);

    return (
        <> {isLoadingList ? <CenteredLoadingSpinner sx={{ mt: 10 }} /> :
            <AasList
                shells={aasList}
                selectedAasList={selectedAasList}
                updateSelectedAasList={updateSelectedAasList}
                comparisonFeatureFlag={env.COMPARISON_FEATURE_FLAG}>
            </AasList> }
        </>
    );
}
