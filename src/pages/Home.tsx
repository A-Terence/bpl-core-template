import { useState } from 'react';

import { useTenant } from '../context/TenantContext';

import type { StatusFilter } from '../context/FleetContext';

import FleetSafetyScore from '../components/home/FleetSafetyScore';

import StatusStatsRow, { type MetricPeriod } from '../components/home/StatusStatsRow';

import FleetViewCard from '../components/home/FleetViewCard';

import AlertsWidget from '../components/home/AlertsWidget';

import DispatchWidget from '../components/home/DispatchWidget';

import FuelChartWidget from '../components/home/FuelChartWidget';

import DriverPerformanceWidget from '../components/home/DriverPerformanceWidget';

import MaintenanceWidget from '../components/home/MaintenanceWidget';

import AiInsightsWidget from '../components/home/AiInsightsWidget';

import { EnvironmentStrip } from '../components/home/EnvironmentStrip';



export default function Home() {

  const { isEnabled } = useTenant();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const [metricPeriod, setMetricPeriod] = useState<MetricPeriod>('week');

  const showFleet = isEnabled('fleet');

  const showAlerts = isEnabled('incidents') || isEnabled('panic');

  const showDispatch = isEnabled('dispatch');



  return (

    <div className="bpl-home-grid">

      {(isEnabled('safety') || showFleet) && (

        <div className="bpl-home-score-row">

          {isEnabled('safety') && <FleetSafetyScore />}

          {showFleet && (

            <StatusStatsRow

              statusFilter={statusFilter}

              onFilterChange={setStatusFilter}

              metricPeriod={metricPeriod}

              onMetricPeriodChange={setMetricPeriod}

            />

          )}

        </div>

      )}



      {showFleet && (

        <div className="bpl-home-mid-row bpl-home-mid-row--cols-3">

          <FleetViewCard statusFilter={statusFilter} />

          {showDispatch && <DispatchWidget variant="mid" />}

          {isEnabled('fuel') && <FuelChartWidget />}

        </div>

      )}



      <div className="bpl-home-bottom-row">

        {showAlerts && <AlertsWidget />}

        {isEnabled('drivers') && <DriverPerformanceWidget />}

        {isEnabled('maintenance') && <MaintenanceWidget />}

        {isEnabled('aria') && <AiInsightsWidget />}

      </div>



      {isEnabled('environment') && <EnvironmentStrip />}

    </div>

  );

}

