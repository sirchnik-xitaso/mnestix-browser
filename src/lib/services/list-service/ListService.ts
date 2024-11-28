import { IAssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/apiInterface';
import { AssetAdministrationShellRepositoryApi } from 'lib/api/basyx-v3/api';
import { mnestixFetch } from 'lib/api/infrastructure';

export class ListService {
    private constructor(readonly targetAasRepositoryClient: IAssetAdministrationShellRepositoryApi) {}

    static create(targetAasRepositoryBaseUrl: string): ListService {
        const targetAasRepositoryClient = AssetAdministrationShellRepositoryApi.create(
            targetAasRepositoryBaseUrl,
            mnestixFetch(),
        );
        return new ListService(targetAasRepositoryClient);
    }

    async getAllAssetAdministrationShells(limit: number, cursor?: string) {
        const response = await this.targetAasRepositoryClient.getAllAssetAdministrationShells(limit, cursor);
        return response;
    }
}
