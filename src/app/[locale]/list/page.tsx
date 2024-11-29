'use client'

import { Box } from '@mui/material';
import { AasListView } from 'app/[locale]/list/_components/AasListView';
import ListHeader from 'components/basics/ListHeader';
import {useEnv} from "../../env/provider";
import { AasListViewDeprecated } from "./_components-deprecated/AasListViewDeprecated";

export default function Page() {
    const env = useEnv();

    return (
        <Box display="flex" flexDirection="column" marginTop="20px" marginBottom="50px" width="100%">
            <Box width="90%" margin="auto">
                <ListHeader namespace={'aasList'} keyValue={'header'} />
                { env.AAS_LIST_V2_FEATURE_FLAG ? <AasListView/> : <AasListViewDeprecated/> }
            </Box>
        </Box>
    );
}
