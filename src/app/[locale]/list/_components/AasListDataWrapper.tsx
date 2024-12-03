import { AasListDto, ListEntityDto } from 'lib/services/list-service/ListService';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { getAasListEntities } from 'lib/services/list-service/aasListApiActions';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { useState } from 'react';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { CenteredLoadingSpinner } from 'components/basics/CenteredLoadingSpinner';
import AasList from './AasList';
import { useEnv } from 'app/env/provider';
import { SelectProductType } from './filter/SelectProductType';
import { AasListComparisonHeader } from './AasListComparisonHeader';
import { Box, IconButton } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { SelectRepository } from './filter/SelectRepository';

export default function AasListDataWrapper() {
    const [isLoadingList, setIsLoadingList] = useState(false);
    const [aasList, setAasList] = useState<AasListDto>();
    const [, setAasListFiltered] = useState<ListEntityDto[]>();
    const [selectedAasList, setSelectedAasList] = useState<string[]>();
    const env = useEnv();
    const notificationSpawner = useNotificationSpawner();
    const [selectedRepository, setSelectedRepository] = useState<string | undefined>();

    //Pagination
    const [currentCursor, setCurrentCursor] = useState<string>();
    const [cursorHistory, setCursorHistory] = useState<(string | undefined)[]>([]);
    const [currentPage, setCurrentPage] = useState(0);

    useAsyncEffect(async () => {
        await fetchListData();
    }, [selectedRepository]);

    const fetchListData = async (newCursor?: string | undefined, isNext = true) => {
        if (!selectedRepository) return;

        setIsLoadingList(true);
        const response = await getAasListEntities(selectedRepository!, 10, newCursor);

        if (response.success) {
            setAasList(response);
            setAasListFiltered(response.entities);

            setCurrentCursor(response.cursor);

            if (isNext) {
                setCursorHistory((prevHistory) => [...prevHistory, newCursor]);
                setCurrentPage((prevPage) => prevPage + 1);
            } else {
                setCurrentPage((prevPage) => prevPage - 1);
            }
        } else {
            showError(response.error, notificationSpawner);
        }
        setIsLoadingList(false);
    };

    const handleNextPage = async () => {
        await fetchListData(currentCursor, true);
    };

    const handleGoBack = async () => {
        const previousCursor = cursorHistory[currentPage - 2] ?? undefined;
        await fetchListData(previousCursor, false);
    };

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
            <Box display="flex" justifyContent="space-between">
                <Box display="flex" gap={4} marginBottom={2}>
                    <SelectRepository onSelectedRepositoryChanged={setSelectedRepository} />
                    <SelectProductType aasList={aasList?.entities} setAasListFiltered={setAasListFiltered} />
                </Box>
                {env.COMPARISON_FEATURE_FLAG && (
                    <AasListComparisonHeader
                        selectedAasList={selectedAasList}
                        updateSelectedAasList={updateSelectedAasList}
                    />
                )}
            </Box>
            {isLoadingList ? (
                <CenteredLoadingSpinner sx={{ mt: 10 }} />
            ) : (
                <>
                    <AasList
                        shells={aasList}
                        selectedAasList={selectedAasList}
                        updateSelectedAasList={updateSelectedAasList}
                        comparisonFeatureFlag={env.COMPARISON_FEATURE_FLAG}
                    ></AasList>
                    <Box display="flex" justifyContent="flex-end" alignItems="center" gap={4} marginTop={2}>
                        <IconButton onClick={handleGoBack} disabled={currentPage === 1}>
                            <ArrowBackIosIcon />
                        </IconButton>
                        Page: {currentPage}
                        <IconButton onClick={handleNextPage} disabled={!currentCursor}>
                            <ArrowForwardIosIcon />
                        </IconButton>
                    </Box>
                </>
            )}
        </>
    );
}
