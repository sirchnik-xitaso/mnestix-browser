import { screen } from '@testing-library/react';
import { expect } from '@jest/globals';
import { CustomRenderReactIntl } from 'test-utils/CustomRenderReactIntl';
import { CO2EquivalentsDistribution } from 'app/[locale]/viewer/_components/submodel/carbon-footprint/visualization-components/CO2EquivalentsDistribution';

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

jest.mock('recharts', () => {
    const OriginalRechartsModule = jest.requireActual('recharts');

    return {
        ...OriginalRechartsModule,
        ResponsiveContainer: ({ height, children }: never) => (
            <div className="recharts-responsive-container" style={{ width: 800, height }}>
                {children}
            </div>
        ),
    };
});

const co2EquivalentsPerLifecycleStage = {
    A1: 0.235,
    A2: 0.553,
    A3: 0.823,
    A4: 0.123,
};

describe('CarbonFootprint - CO2EquivalentsDistribution', () => {
    it('should use header with correct style', async () => {
        CustomRenderReactIntl(
            <CO2EquivalentsDistribution
                co2EquivalentsPerLifecycleStage={co2EquivalentsPerLifecycleStage}
                totalCO2Equivalents={1.745}
            />,
        );
        const headerTypography = screen.getByTestId('co2-equivalents-totalEquivalents-typography');
        expect(headerTypography).toBeDefined();
        expect(headerTypography).toBeInTheDocument();
        expect(headerTypography).toHaveStyle({
            color: 'rgb(25, 118, 210)',
            fontSize: '24',
        });
        expect(headerTypography.children[0]).toHaveStyle({
            fontWeight: 600,
        });
    });
});
