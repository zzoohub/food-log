import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { TimePeriod, PeriodStats, MetricsDisplayType } from '@/contexts';
import { statsAggregationService } from '@/domains/progress/services/StatsAggregationService';
import { MealStorageService } from '@/domains/meals/services/mealStorage';

export const useStatsQuery = (period: TimePeriod, metricsType: MetricsDisplayType) => {
  const generateQueryKey = (period: TimePeriod, metricsType: MetricsDisplayType) => [
    'progress-stats',
    period.type,
    period.startDate?.getTime() || 'none',
    period.endDate?.getTime() || 'none',
    metricsType,
  ];

  return useSuspenseQuery({
    queryKey: generateQueryKey(period, metricsType),
    queryFn: async (): Promise<PeriodStats> => {
      const meals = await MealStorageService.getAllMeals();
      return statsAggregationService.calculatePeriodStats(meals, period, metricsType);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
};

// Hook for prefetching stats
export const usePrefetchStats = () => {
  const { prefetchQuery } = useQueryClient();

  const prefetchStatsForPeriod = async (period: TimePeriod, metricsType: MetricsDisplayType) => {
    const generateQueryKey = (period: TimePeriod, metricsType: MetricsDisplayType) => [
      'progress-stats',
      period.type,
      period.startDate?.getTime() || 'none',
      period.endDate?.getTime() || 'none',
      metricsType,
    ];

    await prefetchQuery({
      queryKey: generateQueryKey(period, metricsType),
      queryFn: async (): Promise<PeriodStats> => {
        const meals = await MealStorageService.getAllMeals();
        return statsAggregationService.calculatePeriodStats(meals, period, metricsType);
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchStatsForPeriod };
};