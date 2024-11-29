import React, { Dispatch, SetStateAction, useState } from 'react';
import { MenuItem, TextField } from '@mui/material';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { getConnectionDataByTypeAction } from 'lib/services/database/connectionServerActions';
import { ConnectionTypeEnum, getTypeAction } from 'lib/services/database/ConnectionTypeEnum';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { useEnv } from '../../../env/provider';

export function SelectRepository(props: {
    onSelectedRepositoryChanged: Dispatch<SetStateAction<string | undefined>>;
}) {
    const [aasRepositories, setAasRepositories] = useState<string[]>([]);
    const [selectedRepository, setSelectedRepository] = useState<string>('');
    const notificationSpawner = useNotificationSpawner();
    const env = useEnv();

    useAsyncEffect(async () => {
        try {
            const aasRepositories = await getConnectionDataByTypeAction(getTypeAction(ConnectionTypeEnum.AAS_REPOSITORY));
            if (env.AAS_REPO_API_URL) aasRepositories.push(env.AAS_REPO_API_URL)
            setAasRepositories(aasRepositories);
        } catch (error) {
            notificationSpawner.spawn({
                message: error,
                severity: 'error',
            });
            return;
        }
    }, []);

    const onRepositoryChanged = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setSelectedRepository(event.target.value);
        props.onSelectedRepositoryChanged(event.target.value)
    }

    return (
        <>
            <TextField select
                       value={selectedRepository}
                       label={'AAS Repository'}
                       onChange={(event) => onRepositoryChanged(event)}>
                { aasRepositories.map((repo, index) => {
                    return <MenuItem key={index} value={repo}>{repo}</MenuItem>
                })}
            </TextField>
        </>);
}