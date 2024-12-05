import { CustomRender } from 'test-utils/CustomRender';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { expect } from '@jest/globals';
import AasListDataWrapper from 'app/[locale]/list/_components/AasListDataWrapper';
import * as serverActions from 'lib/services/list-service/aasListApiActions';
import * as connectionServerActions from 'lib/services/database/connectionServerActions';
import { act } from 'preact/test-utils';
import { ListEntityDto } from 'lib/services/list-service/ListService';
import { CurrentAasContextProvider } from 'components/contexts/CurrentAasContext';
import { options } from 'preact';

jest.mock('./../../../../lib/services/list-service/aasListApiActions');
jest.mock('./../../../../lib/services/database/connectionServerActions');
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            prefetch: () => null,
        };
    },
}));

function createTestListEntries(elementCount = 1): ListEntityDto[] {
    const objects: ListEntityDto[] = [];

    for (let i = 0; i < elementCount; i++) {
        const obj: ListEntityDto = {
            aasId: `aasid${i}`,
            assetId: `assetId${i}`,
            thumbnail: '',
        };

        objects.push(obj);
    }

    return objects;
}

describe('AasListDataWrapper', () => {
    beforeEach(() => {
        /* const mockAction = jest.fn(() => {
             return { success: true, entities: [], cursor: '123', error: {} };
         });
         // @ts-expect-error Todo: find out how to use mockImplementation without error from typescript.
         serverActions.getAasListEntities.mockImplementation(mockAction);

         CustomRender(<AasListDataWrapper />);*/
    });

    it('Loads the first page of data and disables the back button.', async () => {
        const backButton = screen.getByTestId('list-back-button');
        expect(backButton).toBeDefined();
        expect(backButton).toBeDisabled();
        expect(backButton).toBeInTheDocument();
    });

    it('Fetches the data with current cursor when next page is loaded', async () => {
        const mockAction = jest.fn(() => {
            return {
                success: true,
                entities: createTestListEntries(11),
                cursor: '123',
                error: {},
            };
        });
        // @ts-expect-error Todo: find out how to use mockImplementation without error from typescript.
        // TODO get env variable set in tests.
        serverActions.getAasListEntities.mockImplementation(mockAction);

        const mockDB = jest.fn(() => {
            return ['https://test-repository.de'];
        });
        // @ts-expect-error mockImplementation
        connectionServerActions.getConnectionDataByTypeAction.mockImplementation(mockDB);

        CustomRender(
            <CurrentAasContextProvider>
                <AasListDataWrapper />
            </CurrentAasContextProvider>,
        );
        await waitFor(() => screen.getByTestId('repository-select'));

        // TODO find a solution how to choose the correct select.
        const select = screen.getAllByRole('combobox')[0];
        fireEvent.mouseDown(select);

        const firstElement = screen.getAllByRole('option')[0];
        fireEvent.click(firstElement);

        await act(() => expect(mockAction).toHaveBeenCalledTimes(1));

        await waitFor(() => screen.getByTestId('list-next-button'));

        const nextButton = screen.getByTestId('list-next-button');
        expect(nextButton).toBeDefined();
        await act(() => nextButton.click());
        await waitFor(() => expect(screen.getByRole('progressbar')).toBeNull);
        screen.debug(undefined, 100000);
        expect(screen.getByText('assetId10', { exact: false })).toBeInTheDocument();
    });
});
